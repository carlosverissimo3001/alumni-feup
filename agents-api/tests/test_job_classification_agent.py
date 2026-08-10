"""Behavioural tests for the job classification agent.

Pins the embedding-lookup and LLM-validation steps before CAR-103 rewrites the
agents onto Pydantic AI, and before CAR-106/CAR-108 change what gets sent to the
model. Redis and the model client are both stubbed — neither is reachable.
"""

from datetime import datetime

import pytest

from app.agents.job_classification import JobClassificationAgent, get_esco_prompt
from app.schemas.job_classification import (
    EscoResult,
    JobClassificationAgentState,
    JobClassificationRoleInput,
)
from app.utils.prompts import VALIDATE_ESCO_CORE_PROMPT, VALIDATE_ESCO_EXTRA_DETAILS


class StubResponse:
    def __init__(self, tool_calls):
        self.tool_calls = tool_calls
        self.content = ""


class StubLLM:
    def __init__(self, response):
        self._response = response
        self.calls = []

    async def ainvoke(self, messages):
        self.calls.append(messages)
        return self._response


class FakeRedis:
    """In-memory stand-in for the agent's Redis cache."""

    def __init__(self):
        self.store = {}
        self.setex_calls = []

    def get(self, key):
        return self.store.get(key)

    def setex(self, key, ttl, value):
        self.setex_calls.append((key, ttl, value))
        self.store[key] = value


@pytest.fixture
def agent():
    a = JobClassificationAgent()
    a._redis_cache = FakeRedis()
    return a


@pytest.fixture
def role():
    return JobClassificationRoleInput(
        role_id="role-1",
        title="Backend Engineer",
        description=None,
        start_date=datetime(2021, 9, 1),
        end_date=None,
        company_name="Feup Systems",
        industry_name="Software",
        is_promotion=False,
    )


@pytest.fixture
def state(role):
    """Mirrors the state `_process_roles_batch` builds."""
    return JobClassificationAgentState(
        role=role,
        messages=[],
        esco_results_from_embeddings=[],
        esco_results_from_agent=[],
        parsed_esco_results=[],
        processing_time=0.0,
        model_used="gpt-4o-mini",
        retry_count=0,
        error=None,
        reasoning=None,
    )


# --- prompt selection ---------------------------------------------------------


def test_first_attempt_uses_the_core_prompt_only():
    assert get_esco_prompt(0) == VALIDATE_ESCO_CORE_PROMPT


def test_retries_append_the_extra_guidance():
    """Retries widen the prompt — that escalation is the point of the retry."""
    prompt = get_esco_prompt(1)

    assert VALIDATE_ESCO_CORE_PROMPT in prompt
    assert VALIDATE_ESCO_EXTRA_DETAILS in prompt


# --- embedding lookup ---------------------------------------------------------


def test_search_query_is_the_title_when_there_is_no_description(monkeypatch, agent, state):
    seen = []
    monkeypatch.setattr(
        "app.agents.job_classification.search_esco_classifications",
        lambda q: seen.append(q) or [],
    )

    agent.get_best_esco_matches_db(state)

    assert seen == ["Backend Engineer"]


def test_description_is_appended_to_the_search_query(monkeypatch, agent, state):
    state["role"].description = "Builds APIs and services"
    seen = []
    monkeypatch.setattr(
        "app.agents.job_classification.search_esco_classifications",
        lambda q: seen.append(q) or [],
    )

    agent.get_best_esco_matches_db(state)

    assert seen == ["Backend Engineer Builds APIs and services"]


def test_cache_hit_skips_the_vector_search(monkeypatch, agent, state):
    """The cache exists to avoid paying for embeddings twice."""
    cached = [{"id": "1", "title": "Software developer", "confidence": 0.9}]
    agent._set_in_cache("Backend Engineer", cached)

    def fail(_query):
        raise AssertionError("vector search ran despite a cache hit")

    monkeypatch.setattr("app.agents.job_classification.search_esco_classifications", fail)

    out = agent.get_best_esco_matches_db(state)

    assert out["esco_results_from_embeddings"] == cached


def test_results_are_cached_on_a_miss(monkeypatch, agent, state):
    results = [EscoResult(id="1", title="Software developer", confidence=0.9)]
    monkeypatch.setattr(
        "app.agents.job_classification.search_esco_classifications", lambda _q: results
    )

    agent.get_best_esco_matches_db(state)

    assert len(agent._redis_cache.setex_calls) == 1
    key, ttl, _value = agent._redis_cache.setex_calls[0]
    assert key == "esco_classification:Backend Engineer"
    assert ttl == agent.CACHE_TTL


def test_empty_results_are_not_cached(monkeypatch, agent, state):
    """Caching an empty result would pin the miss for 24 hours."""
    monkeypatch.setattr("app.agents.job_classification.search_esco_classifications", lambda _q: [])

    agent.get_best_esco_matches_db(state)

    assert agent._redis_cache.setex_calls == []


def test_search_failure_is_recorded_and_does_not_propagate(monkeypatch, agent, state):
    """One role failing to classify must not abort the surrounding batch."""

    def boom(_query):
        raise RuntimeError("pgvector connection lost")

    monkeypatch.setattr("app.agents.job_classification.search_esco_classifications", boom)

    out = agent.get_best_esco_matches_db(state)

    assert out["esco_results_from_embeddings"] == []
    assert "pgvector connection lost" in out["error"]


# --- LLM validation -----------------------------------------------------------


def _esco_tool_call(results, reasoning="Closest ESCO match for a backend role."):
    return {
        "name": "return_esco_choices",
        "args": {"results": results, "reasoning": reasoning},
    }


async def test_parses_results_and_reasoning_from_the_tool_call(monkeypatch, agent, state):
    results = [{"id": "1", "title": "Software developer", "confidence": 0.93}]
    stub = StubLLM(StubResponse([_esco_tool_call(results)]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)

    out = await agent.validate_esco_results_batch([state])

    assert out[0]["parsed_esco_results"] == results
    assert out[0]["reasoning"] == "Closest ESCO match for a backend role."


async def test_missing_reasoning_falls_back_to_a_placeholder(monkeypatch, agent, state):
    tool_call = {"name": "return_esco_choices", "args": {"results": []}}
    monkeypatch.setattr(
        "app.agents.job_classification.llm_with_tools", StubLLM(StubResponse([tool_call]))
    )

    out = await agent.validate_esco_results_batch([state])

    assert out[0]["reasoning"] == "No explanation provided."


async def test_embedding_candidates_are_sent_to_the_model(monkeypatch, agent, state):
    """The model's job is to *validate* the shortlist, so it must receive it."""
    state["esco_results_from_embeddings"] = [
        EscoResult(id="42", title="Systems analyst", confidence=0.81)
    ]
    stub = StubLLM(StubResponse([_esco_tool_call([])]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)

    await agent.validate_esco_results_batch([state])

    prompt = "\n".join(m.content for m in stub.calls[0])
    assert "Systems analyst" in prompt
    assert "Backend Engineer" in prompt


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Known bug, same shape as the one in seniority.classify_seniority: when the "
        "model returns no `return_esco_choices` tool call, _validate_single falls off "
        "the end and implicitly returns None, so asyncio.gather collects None into the "
        "results list and batch_update_classifications then raises on None['role']. "
        "location.resolve_geo gets this right — it returns state outside the branch. "
        "Fix during CAR-103; this test will start passing then."
    ),
)
async def test_missing_tool_call_still_returns_the_state(monkeypatch, agent, state):
    stub = StubLLM(StubResponse([{"name": "some_other_tool", "args": {}}]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)

    out = await agent.validate_esco_results_batch([state])

    assert out[0] is not None


async def test_batches_are_processed_together(monkeypatch, agent, state, role):
    """Up to three roles go in one chunk; a fourth would trigger a 5s sleep."""
    stub = StubLLM(StubResponse([_esco_tool_call([])]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)
    states = [dict(state), dict(state), dict(state)]

    out = await agent.validate_esco_results_batch(states)

    assert len(out) == 3
    assert len(stub.calls) == 3
