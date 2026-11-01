"""Persistence correctness tests for esco_db (CAR-470).

The DB session is faked rather than hitting a real database: what matters
here is the *order* of operations (validate before delete, one commit) and
what happens when a step fails, not SQL correctness. A FakeSession records
every call so a test can assert on exactly what happened.
"""

from datetime import datetime

import pytest

from app.schemas.job_classification import (
    JobClassificationAgentState,
    JobClassificationRoleInput,
)
from app.utils.esco_db import (
    update_role_with_classifications,
    update_role_with_classifications_batch,
)


class FakeQuery:
    def __init__(self, session, model):
        self._session = session
        self._model = model

    def filter(self, *_args, **_kwargs):
        return self

    def delete(self):
        self._session.deleted_for.append(self._model)
        return 1

    def all(self):
        # Used by the CAR-480 protection check (bulk lookup of protected
        # role_ids). Tests that care about protection set
        # session.protected_role_ids explicitly; everything else keeps
        # today's "nothing is protected" behavior.
        protected = getattr(self._session, "protected_role_ids", set())
        return [_Row(role_id=rid) for rid in protected]

    def first(self):
        # Scoped per FakeSession instance, which each test creates fresh for
        # one role - good enough fidelity without parsing SQLAlchemy filter
        # expressions in the fake.
        if getattr(self._session, "protected_role_ids", set()):
            return _Row(was_accepted_by_user=True, was_modified_by_user=True)
        return None


class _Row:
    """Minimal stand-in for a SQLAlchemy Row, attribute access only."""

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeSession:
    """Records calls instead of touching a real database.

    `commit_error`, when set, is raised the first time `commit()` is called,
    to simulate a write failure after everything looked valid.
    `protected_role_ids` makes the CAR-480 protection lookup report those
    role_ids as user-protected (modified/accepted), same as a real query
    would for a role with that feedback already recorded.
    """

    def __init__(self, commit_error: Exception | None = None, protected_role_ids=None):
        self.added = []
        self.deleted_for = []
        self.committed = False
        self.rolled_back = False
        self._commit_error = commit_error
        self.protected_role_ids = protected_role_ids or set()

    def query(self, *_args):
        return FakeQuery(self, _args[0] if _args else None)

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        if self._commit_error is not None:
            raise self._commit_error
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def refresh(self, _obj):
        pass


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
    return JobClassificationAgentState(
        role=role,
        messages=[],
        esco_results_from_embeddings=[],
        esco_results_from_agent=[],
        parsed_esco_results=[{"id": "esco-1", "title": "Software developer", "confidence": 0.9}],
        processing_time=0.0,
        model_used="gpt-4o-mini",
        retry_count=0,
        error=None,
        reasoning="Best match for the role.",
    )


# --- single-role replace (bug 1: validate before delete) ----------------------


def test_valid_replacement_deletes_and_writes_in_one_commit(state):
    db = FakeSession()

    ok = update_role_with_classifications(db, state)

    assert ok is True
    assert len(db.deleted_for) == 1  # delete happened exactly once
    assert len(db.added) == 1
    assert db.added[0].role_id == "role-1"
    assert db.committed is True


def test_unparsable_replacement_never_deletes_the_existing_row(state):
    """A parse failure must be a no-op, not a deletion with nothing written
    in its place."""
    state["parsed_esco_results"] = [{"id": "esco-1"}]  # missing required "confidence"
    db = FakeSession()

    ok = update_role_with_classifications(db, state)

    assert ok is False
    assert db.deleted_for == []
    assert db.added == []
    assert db.committed is False


def test_empty_replacement_never_deletes_the_existing_row(state):
    state["parsed_esco_results"] = []
    db = FakeSession()

    ok = update_role_with_classifications(db, state)

    assert ok is False
    assert db.deleted_for == []
    assert db.committed is False


def test_write_failure_after_validation_is_rolled_back_and_reported(state):
    """Validation passing is not enough - a failure in the commit itself must
    still roll back and be reported as a failure, not look like success."""
    db = FakeSession(commit_error=RuntimeError("connection reset"))

    ok = update_role_with_classifications(db, state)

    assert ok is False
    assert db.rolled_back is True


# --- batch replace (bugs 1 and 2) ----------------------------------------------


async def test_batch_parse_failure_for_one_role_does_not_touch_its_existing_row():
    updates = [
        {"role_id": "role-bad", "classifications": [{"id": "esco-1"}], "reasoning": ""},
    ]
    db = FakeSession()

    outcomes = await update_role_with_classifications_batch(db, updates)

    assert db.deleted_for == []
    assert db.added == []
    assert len(outcomes) == 1
    assert outcomes[0].role_id == "role-bad"
    assert outcomes[0].success is False
    assert outcomes[0].error


async def test_batch_one_bad_role_does_not_block_a_valid_sibling():
    updates = [
        {"role_id": "role-bad", "classifications": [{"id": "esco-1"}], "reasoning": ""},
        {
            "role_id": "role-good",
            "classifications": [{"id": "esco-2", "title": "Software developer", "confidence": 0.9}],
            "reasoning": "fits",
        },
    ]
    db = FakeSession()

    outcomes = await update_role_with_classifications_batch(db, updates)

    by_role = {o.role_id: o for o in outcomes}
    assert by_role["role-bad"].success is False
    assert by_role["role-good"].success is True
    assert len(db.deleted_for) == 1  # only the valid role's old row was deleted
    assert len(db.added) == 1
    assert db.added[0].role_id == "role-good"
    assert db.committed is True


async def test_batch_write_failure_is_a_typed_failure_outcome_not_silent():
    """A failed DB write must be observable by the caller, not look identical
    to success (the bug: catching and logging without propagating)."""
    updates = [
        {
            "role_id": "role-1",
            "classifications": [{"id": "esco-1", "title": "Software developer", "confidence": 0.9}],
            "reasoning": "fits",
        },
    ]
    db = FakeSession(commit_error=RuntimeError("connection reset"))

    outcomes = await update_role_with_classifications_batch(db, updates)

    assert db.rolled_back is True
    assert len(outcomes) == 1
    assert outcomes[0].success is False
    assert "connection reset" in outcomes[0].error


# --- CAR-480: protect user feedback from being overwritten --------------------


def test_singular_update_skips_a_user_modified_role(state):
    db = FakeSession(protected_role_ids={"role-1"})

    ok = update_role_with_classifications(db, state)

    assert ok is True
    assert db.deleted_for == []
    assert db.added == []
    assert db.committed is False


def test_singular_update_still_writes_an_unprotected_role(state):
    db = FakeSession()  # nothing protected

    ok = update_role_with_classifications(db, state)

    assert ok is True
    assert len(db.deleted_for) == 1
    assert len(db.added) == 1
    assert db.committed is True


async def test_batch_skips_accepted_role_without_deleting_or_writing():
    updates = [
        {
            "role_id": "role-accepted",
            "classifications": [{"id": "esco-1", "title": "Software developer", "confidence": 0.9}],
            "reasoning": "fits",
        },
    ]
    db = FakeSession(protected_role_ids={"role-accepted"})

    outcomes = await update_role_with_classifications_batch(db, updates)

    assert db.deleted_for == []
    assert db.added == []
    assert len(outcomes) == 1
    assert outcomes[0].role_id == "role-accepted"
    assert outcomes[0].success is True  # protected = intentional no-op, not a failure


async def test_batch_protects_one_role_while_updating_its_unprotected_sibling():
    updates = [
        {
            "role_id": "role-protected",
            "classifications": [{"id": "esco-1", "title": "Software developer", "confidence": 0.9}],
            "reasoning": "fits",
        },
        {
            "role_id": "role-open",
            "classifications": [{"id": "esco-2", "title": "Data scientist", "confidence": 0.8}],
            "reasoning": "fits too",
        },
    ]
    db = FakeSession(protected_role_ids={"role-protected"})

    outcomes = await update_role_with_classifications_batch(db, updates)

    by_role = {o.role_id: o for o in outcomes}
    assert by_role["role-protected"].success is True
    assert by_role["role-open"].success is True
    assert len(db.deleted_for) == 1  # only the open role's old row was deleted
    assert len(db.added) == 1
    assert db.added[0].role_id == "role-open"
    assert db.committed is True
