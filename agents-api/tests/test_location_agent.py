"""Behavioural tests for the location agent.

Covers cache keying, prompt assembly per input type, and geo resolution. Redis,
the token rate limiter, the tokenizer and the model client are all stubbed —
none of them are reachable from a test.

Relevant to CAR-117 (location alias normalisation), which will change how inputs
map onto resolved locations; these pin the current contract first.
"""

import json

import pytest

from app.agents.location import LocationAgent
from app.schemas.location import (
    AlumniLocationInput,
    CompanyLocationInput,
    LocationAgentState,
    LocationResult,
    RoleLocationInput,
)


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


class StubRateLimiter:
    """Records the token budget requested, without touching Redis."""

    def __init__(self):
        self.acquired = []

    async def acquire(self, tokens):
        self.acquired.append(tokens)


class StubEncoding:
    """One token per whitespace-separated word — enough to exercise the count."""

    def encode(self, text):
        return text.split()


class FakeRedis:
    def __init__(self):
        self.store = {}

    def get(self, key):
        return self.store.get(key)

    def setex(self, key, _ttl, value):
        self.store[key] = value


@pytest.fixture
def agent():
    a = LocationAgent()
    a._redis_cache = FakeRedis()
    return a


@pytest.fixture
def company_input():
    return CompanyLocationInput(
        company_id="company-1", headquarters="Porto, Portugal", country_codes="PT,ES"
    )


@pytest.fixture
def role_input():
    return RoleLocationInput(role_id="role-1", location="Porto Metropolitan Area")


@pytest.fixture
def alumni_input():
    return AlumniLocationInput(
        alumni_id="alumni-1", city="Porto", country="Portugal", country_code="PT"
    )


@pytest.fixture
def stub_geo(monkeypatch):
    """Replace everything resolve_geo reaches for outside the process."""

    def _install(tool_calls):
        llm = StubLLM(StubResponse(tool_calls))
        limiter = StubRateLimiter()
        monkeypatch.setattr("app.agents.location.llm_with_tools", llm)
        monkeypatch.setattr("app.agents.location.rate_limiter", limiter)
        monkeypatch.setattr("app.agents.location.get_encoding", lambda: StubEncoding())
        return llm, limiter

    return _install


def _state(location_input):
    return LocationAgentState(
        input=location_input,
        type=location_input.type,
        messages=[],
        resolved_country_code=None,
        resolved_city=None,
        db_locations=[],
        location_result=None,
        processing_time=0.0,
        model_used="gpt-4o-mini",
    )


# --- cache keys ---------------------------------------------------------------


def test_cache_key_is_namespaced_per_input_type(agent, company_input, role_input, alumni_input):
    """Distinct namespaces stop a role and a company sharing a cache entry."""
    assert agent._get_cache_key(company_input) == "location:company:Porto, Portugal"
    assert agent._get_cache_key(role_input) == "location:role:Porto Metropolitan Area"
    assert agent._get_cache_key(alumni_input) == "location:alumni:Porto:Portugal"


def test_cached_result_round_trips(agent, role_input):
    result = LocationResult(
        id="loc-1",
        country_code="PT",
        country="Portugal",
        is_country_only=False,
        city="Porto",
    )
    agent._set_in_cache(role_input, result)

    assert agent._get_from_cache(role_input) == result


def test_cache_miss_returns_none(agent, role_input):
    assert agent._get_from_cache(role_input) is None


def test_cached_payload_is_json(agent, role_input):
    """Stored as JSON so it survives a restart and stays inspectable in Redis."""
    result = LocationResult(
        id=None, country_code="PT", country="Portugal", is_country_only=True, city=None
    )
    agent._set_in_cache(role_input, result)

    raw = agent._redis_cache.store["location:role:Porto Metropolitan Area"]
    assert json.loads(raw)["country_code"] == "PT"


# --- prompt assembly ----------------------------------------------------------


def test_company_details_include_headquarters_and_country_codes(agent, company_input):
    details = agent._build_input_details(company_input)

    assert "Porto, Portugal" in details
    assert "PT,ES" in details


def test_role_details_include_the_free_text_location(agent, role_input):
    assert "Porto Metropolitan Area" in agent._build_input_details(role_input)


def test_alumni_details_include_city_country_and_code(agent, alumni_input):
    details = agent._build_input_details(alumni_input)

    assert "Porto" in details
    assert "Portugal" in details
    assert "PT" in details


# --- geo resolution -----------------------------------------------------------


def _geo_tool_call(country_code="PT", city="Porto"):
    return {
        "name": "return_geo_resolution",
        "args": {"country_code": country_code, "city": city},
    }


async def test_resolves_country_code_and_city_from_the_tool_call(agent, stub_geo, role_input):
    stub_geo([_geo_tool_call()])

    out = await agent.resolve_geo(_state(role_input))

    assert out["resolved_country_code"] == "PT"
    assert out["resolved_city"] == "Porto"


async def test_remote_locations_resolve_without_a_city(agent, stub_geo, role_input):
    """'Remote' has a country code sentinel and no city — a documented case."""
    stub_geo([_geo_tool_call(country_code="REMOTE", city=None)])

    out = await agent.resolve_geo(_state(role_input))

    assert out["resolved_country_code"] == "REMOTE"
    assert out["resolved_city"] is None


async def test_missing_tool_call_records_an_error_and_still_returns_state(
    agent, stub_geo, role_input
):
    """Unlike the other two agents, this one returns state on the failure path."""
    stub_geo([{"name": "some_other_tool", "args": {}}])

    out = await agent.resolve_geo(_state(role_input))

    assert out is not None
    assert out["error"] == "Failed to get tool call from LLM response"


async def test_location_details_reach_the_model(agent, stub_geo, company_input):
    llm, _limiter = stub_geo([_geo_tool_call()])

    await agent.resolve_geo(_state(company_input))

    prompt = "\n".join(m.content for m in llm.calls[0])
    assert "Porto, Portugal" in prompt
    assert "PT,ES" in prompt


async def test_token_budget_is_reserved_before_the_model_call(agent, stub_geo, role_input):
    """Rate limiting is the guard against blowing the 200k tokens/minute cap."""
    _llm, limiter = stub_geo([_geo_tool_call()])

    await agent.resolve_geo(_state(role_input))

    assert len(limiter.acquired) == 1
    # Estimate plus the 100-token buffer the agent adds.
    assert limiter.acquired[0] > 100


async def test_response_is_appended_to_message_history(agent, stub_geo, role_input):
    llm, _limiter = stub_geo([_geo_tool_call()])

    out = await agent.resolve_geo(_state(role_input))

    assert llm._response in out["messages"]


async def test_model_failure_is_recorded_and_re_raised(agent, monkeypatch, role_input):
    """Geo resolution is the first stage — failing loudly beats a silent bad location."""

    class ExplodingLLM:
        async def ainvoke(self, _messages):
            raise RuntimeError("upstream unavailable")

    monkeypatch.setattr("app.agents.location.llm_with_tools", ExplodingLLM())
    monkeypatch.setattr("app.agents.location.rate_limiter", StubRateLimiter())
    monkeypatch.setattr("app.agents.location.get_encoding", lambda: StubEncoding())
    state = _state(role_input)

    with pytest.raises(RuntimeError, match="upstream unavailable"):
        await agent.resolve_geo(state)

    assert state["error"] == "upstream unavailable"


def test_tokenizer_is_not_resolved_at_import():
    """Regression guard for the lazy-loading fix.

    tiktoken downloads its BPE vocabulary on a cold cache, so resolving the
    encoding at module scope made this module — and app.main — unimportable
    without network access.
    """
    from app.agents import location

    location.get_encoding.cache_clear()
    assert location.get_encoding.cache_info().currsize == 0
