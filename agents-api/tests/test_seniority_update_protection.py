"""CAR-480: _update_roles_with_seniority must not overwrite a seniority level
the profile UI already recorded as user-accepted or user-modified.

get_role_by_id/update_role are monkeypatched rather than hitting a real
session - what matters here is whether the write is attempted, not SQL
correctness.
"""

import pytest

from app.agents.seniority import SeniorityAgent
from app.schemas.seniority import SeniorityAgentState


class FakeRole:
    def __init__(
        self,
        role_id="role-1",
        was_seniority_level_accepted_by_user=None,
        was_seniority_level_modified_by_user=None,
    ):
        self.id = role_id
        self.seniority_level = None
        self.metadata_ = None
        self.updated_by = None
        self.was_seniority_level_accepted_by_user = was_seniority_level_accepted_by_user
        self.was_seniority_level_modified_by_user = was_seniority_level_modified_by_user


def _state(role_id="role-1"):
    return SeniorityAgentState(
        batch=None,
        messages=[],
        seniority_results_from_agent=None,
        parsed_seniority_results=[
            {
                "role_id": role_id,
                "seniority": "DIRECTOR",
                "confidence": 0.9,
                "reasoning": "Scoped a large team.",
            }
        ],
        processing_time=0.0,
        model_used="gpt-4o-mini",
        retry_count=0,
        error=None,
    )


@pytest.fixture
def agent():
    return SeniorityAgent()


def test_skips_a_user_modified_role(agent, monkeypatch):
    role = FakeRole(was_seniority_level_modified_by_user=True)
    updated = []
    monkeypatch.setattr("app.agents.seniority.get_role_by_id", lambda role_id, db: role)
    monkeypatch.setattr("app.agents.seniority.update_role", lambda r, db: updated.append(r))

    agent._update_roles_with_seniority(_state(), db=None)

    assert updated == []
    assert role.seniority_level is None  # untouched


def test_skips_a_user_accepted_role(agent, monkeypatch):
    role = FakeRole(was_seniority_level_accepted_by_user=True)
    updated = []
    monkeypatch.setattr("app.agents.seniority.get_role_by_id", lambda role_id, db: role)
    monkeypatch.setattr("app.agents.seniority.update_role", lambda r, db: updated.append(r))

    agent._update_roles_with_seniority(_state(), db=None)

    assert updated == []
    assert role.seniority_level is None


def test_updates_an_unprotected_role(agent, monkeypatch):
    role = FakeRole()  # both flags unset
    updated = []
    monkeypatch.setattr("app.agents.seniority.get_role_by_id", lambda role_id, db: role)
    monkeypatch.setattr("app.agents.seniority.update_role", lambda r, db: updated.append(r))

    agent._update_roles_with_seniority(_state(), db=None)

    assert len(updated) == 1
    assert role.seniority_level.value == "DIRECTOR"


def test_updates_a_role_the_user_explicitly_rejected(agent, monkeypatch):
    """accepted=False (a rejection) is not an approved replacement value, so
    the row stays eligible for recomputation - same as an unset row."""
    role = FakeRole(was_seniority_level_accepted_by_user=False)
    updated = []
    monkeypatch.setattr("app.agents.seniority.get_role_by_id", lambda role_id, db: role)
    monkeypatch.setattr("app.agents.seniority.update_role", lambda r, db: updated.append(r))

    agent._update_roles_with_seniority(_state(), db=None)

    assert len(updated) == 1
    assert role.seniority_level.value == "DIRECTOR"
