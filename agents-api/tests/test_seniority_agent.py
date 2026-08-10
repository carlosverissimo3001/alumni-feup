"""Behavioural tests for the seniority agent.

These exist to pin current behaviour before CAR-103 rewrites all three agents
onto Pydantic AI. They assert on prompt construction and response parsing — the
two things a framework migration is most likely to change silently.
"""

import pytest

from app.agents.seniority import SeniorityAgent
from app.schemas.seniority import BatchSeniorityInput, RoleSeniorityInput, SeniorityAgentState


class StubResponse:
    """Stands in for a LangChain AIMessage carrying tool calls."""

    def __init__(self, tool_calls):
        self.tool_calls = tool_calls
        self.content = ""


class StubLLM:
    """Records the messages it was invoked with, returns a canned response."""

    def __init__(self, response):
        self._response = response
        self.calls = []

    def invoke(self, messages):
        self.calls.append(messages)
        return self._response


@pytest.fixture
def batch():
    return BatchSeniorityInput(
        alumni_id="alumni-1",
        roles=[
            RoleSeniorityInput(
                role_id="role-1",
                title="Staff Software Engineer",
                company="Feup Systems",
                duration="3 years",
                start_date="2021-09-01",
                end_date=None,
                is_current=True,
            )
        ],
        total_experience="8 years",
        industries=["Software"],
        companies=["Feup Systems"],
    )


@pytest.fixture
def state(batch):
    """Mirrors the state `SeniorityAgent.process_role_batch` builds."""
    return SeniorityAgentState(
        batch=batch,
        messages=[],
        seniority_results_from_agent=None,
        parsed_seniority_results=[],
        processing_time=0.0,
        model_used="gpt-4o-mini",
        retry_count=0,
        error=None,
    )


def _tool_call(results):
    return {"name": "return_seniority_choices", "args": {"results": results}}


def test_parses_results_from_the_tool_call(monkeypatch, state):
    results = [
        {
            "role_id": "role-1",
            "seniority": "MID_SENIOR_LEVEL",
            "confidence": 0.91,
            "reasoning": "Staff title with 8 years of experience.",
        }
    ]
    stub = StubLLM(StubResponse([_tool_call(results)]))
    monkeypatch.setattr("app.agents.seniority.llm_with_tools", stub)

    out = SeniorityAgent().classify_seniority(state)

    assert out["parsed_seniority_results"] == results


def test_sends_role_context_to_the_model(monkeypatch, state):
    stub = StubLLM(StubResponse([_tool_call([])]))
    monkeypatch.setattr("app.agents.seniority.llm_with_tools", stub)

    SeniorityAgent().classify_seniority(state)

    assert len(stub.calls) == 1
    prompt = "\n".join(m.content for m in stub.calls[0])
    # The model cannot judge seniority without the title, employer, and tenure.
    assert "Staff Software Engineer" in prompt
    assert "Feup Systems" in prompt
    assert "8 years" in prompt


def test_open_ended_role_is_described_as_present(monkeypatch, state):
    stub = StubLLM(StubResponse([_tool_call([])]))
    monkeypatch.setattr("app.agents.seniority.llm_with_tools", stub)

    SeniorityAgent().classify_seniority(state)

    assert "Present" in "\n".join(m.content for m in stub.calls[0])


def test_appends_the_response_to_message_history(monkeypatch, state):
    response = StubResponse([_tool_call([])])
    monkeypatch.setattr("app.agents.seniority.llm_with_tools", StubLLM(response))

    out = SeniorityAgent().classify_seniority(state)

    assert response in out["messages"]


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Known bug: when the model returns no `return_seniority_choices` tool call, "
        "classify_seniority falls off the end and implicitly returns None instead of "
        "the state. Downstream nodes then receive None. Should return the unchanged "
        "state (or raise). Fix during CAR-103; this test will start passing then."
    ),
)
def test_missing_tool_call_still_returns_the_state(monkeypatch, state):
    stub = StubLLM(StubResponse([{"name": "some_other_tool", "args": {}}]))
    monkeypatch.setattr("app.agents.seniority.llm_with_tools", stub)

    out = SeniorityAgent().classify_seniority(state)

    assert out is not None
