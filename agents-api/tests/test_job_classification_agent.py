"""Behavioural tests for the job classification agent.

Pins the embedding-lookup and LLM-validation steps before CAR-103 rewrites the
agents onto Pydantic AI, and before CAR-106/CAR-108 change what gets sent to the
model. Redis and the model client are both stubbed — neither is reachable.
"""

import asyncio
from datetime import datetime

import pytest

from app.agents.job_classification import (
    MAX_CONCURRENT_LLM_CALLS,
    JobClassificationAgent,
    get_esco_prompt,
)
from app.schemas.job_classification import (
    ClassificationWriteOutcome,
    EscoResult,
    JobClassificationAgentState,
    JobClassificationRoleInput,
    ValidationOutcome,
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


def test_retry_prompt_does_not_contradict_the_core_tool_call_contract():
    """The core prompt requires a tool call; the retry addendum must not
    demand a different output contract (e.g. a raw JSON array) instead."""
    assert "return_esco_choices" in VALIDATE_ESCO_CORE_PROMPT
    assert "return_esco_choices" in VALIDATE_ESCO_EXTRA_DETAILS

    assert "valid json array" not in VALIDATE_ESCO_EXTRA_DETAILS.lower()
    assert "must call" in VALIDATE_ESCO_EXTRA_DETAILS.lower()


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
    state["esco_results_from_embeddings"] = [
        EscoResult(id="42", title="Systems analyst", confidence=0.81)
    ]
    results = [{"id": "1", "title": "Software developer", "confidence": 0.93}]
    stub = StubLLM(StubResponse([_esco_tool_call(results)]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)

    out = await agent.validate_esco_results_batch([state])

    assert out[0]["parsed_esco_results"] == results
    assert out[0]["reasoning"] == "Closest ESCO match for a backend role."
    assert out[0]["outcome"] == ValidationOutcome.SUCCESS


async def test_missing_reasoning_falls_back_to_a_placeholder(monkeypatch, agent, state):
    state["esco_results_from_embeddings"] = [
        EscoResult(id="42", title="Systems analyst", confidence=0.81)
    ]
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


async def test_missing_tool_call_returns_a_typed_invalid_response_outcome(
    monkeypatch, agent, state
):
    """A response with no `return_esco_choices` tool call is a schema failure:
    it must come back as an explicit typed outcome, not fall through to None."""
    state["esco_results_from_embeddings"] = [
        EscoResult(id="42", title="Systems analyst", confidence=0.81)
    ]
    stub = StubLLM(StubResponse([{"name": "some_other_tool", "args": {}}]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)

    out = await agent.validate_esco_results_batch([state])

    assert out[0] is not None
    assert out[0]["outcome"] == ValidationOutcome.INVALID_LLM_RESPONSE
    assert out[0]["parsed_esco_results"] == []
    assert out[0]["error"]


async def test_batches_are_processed_together(monkeypatch, agent, state, role):
    """Up to three roles go in one chunk; a fourth would trigger a 5s sleep."""
    state["esco_results_from_embeddings"] = [
        EscoResult(id="42", title="Systems analyst", confidence=0.81)
    ]
    stub = StubLLM(StubResponse([_esco_tool_call([])]))
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", stub)
    states = [dict(state), dict(state), dict(state)]

    out = await agent.validate_esco_results_batch(states)

    assert len(out) == 3
    assert len(stub.calls) == 3


# --- global concurrency budget (CAR-469) --------------------------------------


async def test_global_semaphore_caps_peak_concurrent_calls_across_many_alumni(
    monkeypatch, agent, role
):
    """Reproduces the incident shape: ~50 alumni classified concurrently, each
    gathering several roles at once internally. Without a process-wide budget
    this fans out to ~150 overlapping provider calls; the module-level
    semaphore must keep the real peak at or below MAX_CONCURRENT_LLM_CALLS.
    """
    in_flight = 0
    peak = 0

    class SlowStubLLM:
        async def ainvoke(self, _messages):
            nonlocal in_flight, peak
            in_flight += 1
            peak = max(peak, in_flight)
            await asyncio.sleep(0.05)
            in_flight -= 1
            return StubResponse([_esco_tool_call([])])

    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", SlowStubLLM())

    def make_alumnus_states(role_count):
        return [
            JobClassificationAgentState(
                role=role,
                messages=[],
                # Non-empty: CAR-470's retrieval-skip path filters out empty
                # candidate lists before they ever reach the semaphore, which
                # would hide the concurrency cap this test exists to prove.
                esco_results_from_embeddings=[
                    EscoResult(id="42", title="Systems analyst", confidence=0.81)
                ],
                esco_results_from_agent=[],
                parsed_esco_results=[],
                processing_time=0.0,
                model_used="gpt-4o-mini",
                retry_count=0,
                error=None,
                reasoning=None,
            )
            for _ in range(role_count)
        ]

    alumni_batches = [make_alumnus_states(3) for _ in range(50)]

    await asyncio.gather(*[agent.validate_esco_results_batch(states) for states in alumni_batches])

    assert peak <= MAX_CONCURRENT_LLM_CALLS
    # Demand (150 calls) comfortably exceeds the budget, so the cap is
    # actually the thing holding peak down, not a coincidence.
    assert peak == MAX_CONCURRENT_LLM_CALLS


class ExplodingLLM:
    """Fails loudly if ever invoked — used to prove a code path is unreachable."""

    async def ainvoke(self, _messages):
        raise AssertionError("LLM was called despite having nothing to validate")


async def test_empty_retrieval_skips_the_llm_call_entirely(monkeypatch, agent, state):
    """An empty candidate list can never produce a correct answer, so the
    (paid) LLM call must not even be attempted."""
    assert state["esco_results_from_embeddings"] == []
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", ExplodingLLM())

    out = await agent.validate_esco_results_batch([state])

    assert out[0]["outcome"] == ValidationOutcome.EMPTY_RETRIEVAL
    assert out[0]["parsed_esco_results"] == []


async def test_retrieval_failure_is_distinguished_from_plain_empty_retrieval(
    monkeypatch, agent, state
):
    """A retrieval error and a legitimately-empty search both skip the LLM,
    but they are reported as different typed outcomes."""
    state["error"] = "Failed to search ESCO classifications: pgvector connection lost"
    monkeypatch.setattr("app.agents.job_classification.llm_with_tools", ExplodingLLM())

    out = await agent.validate_esco_results_batch([state])

    assert out[0]["outcome"] == ValidationOutcome.RETRIEVAL_FAILED


# --- persisting classifications (bug 2: swallowed write failures) ------------


class _FakeSessionScope:
    """Stands in for `session_scope()` so no real DB connection is needed."""

    def __enter__(self):
        return object()

    def __exit__(self, *exc_info):
        return False


async def test_a_failed_write_is_observable_by_the_caller(monkeypatch, agent, state):
    """The DB write failing must not look identical to success - the caller
    needs to be able to tell, so the executor can mark the task FAILED."""
    state["parsed_esco_results"] = [
        {"id": "esco-1", "title": "Software developer", "confidence": 0.9}
    ]
    state["reasoning"] = "fits"

    monkeypatch.setattr("app.agents.job_classification.session_scope", _FakeSessionScope)

    async def fake_batch_write(_db, _updates, _action_by):
        return [
            ClassificationWriteOutcome(role_id="role-1", success=False, error="connection reset")
        ]

    monkeypatch.setattr(
        "app.agents.job_classification.update_role_with_classifications_batch", fake_batch_write
    )

    with pytest.raises(RuntimeError, match="role-1"):
        await agent.batch_update_classifications([state])


async def test_a_successful_write_does_not_raise(monkeypatch, agent, state):
    state["parsed_esco_results"] = [
        {"id": "esco-1", "title": "Software developer", "confidence": 0.9}
    ]
    state["reasoning"] = "fits"

    monkeypatch.setattr("app.agents.job_classification.session_scope", _FakeSessionScope)

    async def fake_batch_write(_db, _updates, _action_by):
        return [ClassificationWriteOutcome(role_id="role-1", success=True)]

    monkeypatch.setattr(
        "app.agents.job_classification.update_role_with_classifications_batch", fake_batch_write
    )

    outcomes = await agent.batch_update_classifications([state])

    assert outcomes[0].success is True


async def test_no_parsed_results_skips_the_write_entirely(agent, state):
    """Nothing to persist means nothing is attempted - no session is opened."""
    state["parsed_esco_results"] = []

    outcomes = await agent.batch_update_classifications([state])

    assert outcomes == []
