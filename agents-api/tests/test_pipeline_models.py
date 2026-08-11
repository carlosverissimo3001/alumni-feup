"""Database-backed tests for the pipeline tables.

These are the first tests in the suite that touch a real database. They use the
`db` fixture, which wraps each test in a transaction that is always rolled back,
so they are safe to run against the local container even though it holds a copy
of production.

The pipeline tables are the state model the rest of Agents API v2 is built on
(CAR-155), so their constraints are worth pinning rather than trusting.
"""

import pytest
from sqlalchemy.exc import IntegrityError

from app.db.models import (
    PipelineEntityType,
    PipelineKind,
    PipelineRun,
    PipelineRunStatus,
    PipelineStage,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTask,
    PipelineTaskStatus,
)


@pytest.fixture
def run(db):
    r = PipelineRun(kind=PipelineKind.REFRESH_EXISTING)
    db.add(r)
    db.flush()
    return r


@pytest.fixture
def stage(db, run):
    s = PipelineStage(run_id=run.id, stage=PipelineStageName.CLASSIFY_ROLES, sequence=3)
    db.add(s)
    db.flush()
    return s


def _task(stage, key, entity_id="role-1", **kw):
    return PipelineTask(
        stage_id=stage.id,
        entity_type=PipelineEntityType.ROLE,
        entity_id=entity_id,
        idempotency_key=key,
        **kw,
    )


# --- defaults -----------------------------------------------------------------


def test_a_new_run_starts_in_planning(db, run):
    """Runs begin by working out what they would do, not by doing it."""
    db.refresh(run)
    assert run.status == PipelineRunStatus.PLANNING


def test_a_new_stage_starts_pending(db, stage):
    db.refresh(stage)
    assert stage.status == PipelineStageStatus.PENDING
    assert (stage.total_count, stage.succeeded_count, stage.failed_count) == (0, 0, 0)


def test_a_new_task_starts_queued(db, stage):
    task = _task(stage, "k-queued")
    db.add(task)
    db.flush()
    db.refresh(task)

    assert task.status == PipelineTaskStatus.QUEUED
    assert task.attempts == 0


# --- the dedup guarantee ------------------------------------------------------


def test_duplicate_idempotency_key_is_rejected(db, stage):
    """CAR-116's deduplication, enforced by the database rather than by workers
    remembering to check. Two workers racing on the same entity cannot both win.
    """
    db.add(_task(stage, "k-dup"))
    db.flush()

    db.add(_task(stage, "k-dup"))
    with pytest.raises(IntegrityError):
        db.flush()


def test_distinct_keys_coexist(db, stage):
    db.add(_task(stage, "k-1", entity_id="role-1"))
    db.add(_task(stage, "k-2", entity_id="role-2"))
    db.flush()

    assert db.query(PipelineTask).filter_by(stage_id=stage.id).count() == 2


# --- relationships and cleanup ------------------------------------------------


def test_deleting_a_run_removes_its_stages_and_tasks(db, run, stage):
    """A cancelled or purged run must not leave orphaned rows behind."""
    db.add(_task(stage, "k-cascade"))
    db.flush()

    db.delete(run)
    db.flush()

    assert db.query(PipelineStage).filter_by(run_id=run.id).count() == 0
    assert db.query(PipelineTask).filter_by(stage_id=stage.id).count() == 0


def test_run_reaches_its_tasks_through_stages(db, run, stage):
    db.add(_task(stage, "k-nav"))
    db.flush()
    db.refresh(run)

    assert [t.entity_id for s in run.stages for t in s.tasks] == ["role-1"]


# --- the result payload -------------------------------------------------------


def test_result_round_trips_as_json(db, stage):
    """`result` is the baseline CAR-106 and CAR-108 measure against, so it has
    to survive the round trip with its types intact - a float that comes back a
    string makes confidence comparisons silently wrong.
    """
    payload = {
        "esco_code": "2512",
        "confidence": 0.91,
        "model_used": "gpt-4o-mini",
        "candidates": [{"code": "2512", "score": 0.91}, {"code": "2519", "score": 0.44}],
    }
    task = _task(stage, "k-result", result=payload)
    db.add(task)
    db.flush()
    db.expire(task)

    stored = db.get(PipelineTask, task.id).result
    assert stored == payload
    assert isinstance(stored["confidence"], float)


def test_skip_reason_records_why_work_was_not_done(db, stage):
    """A plan that skips 177 companies has to be able to say why."""
    task = _task(stage, "k-skip", status=PipelineTaskStatus.SKIPPED, skip_reason="fresh")
    db.add(task)
    db.flush()
    db.refresh(task)

    assert task.status == PipelineTaskStatus.SKIPPED
    assert task.skip_reason == "fresh"


# --- stage ordering -----------------------------------------------------------


def test_a_stage_cannot_appear_twice_in_one_run(db, run):
    db.add(PipelineStage(run_id=run.id, stage=PipelineStageName.LINKEDIN, sequence=1))
    db.flush()

    db.add(PipelineStage(run_id=run.id, stage=PipelineStageName.LINKEDIN, sequence=2))
    with pytest.raises(IntegrityError):
        db.flush()


def test_stages_order_by_sequence_not_insertion(db, run):
    """Ordering comes from `sequence` so that inserting a stage in the middle
    later does not silently reorder existing runs.
    """
    for name, seq in [
        (PipelineStageName.LOCATION, 5),
        (PipelineStageName.PLAN, 0),
        (PipelineStageName.COMPANY, 2),
    ]:
        db.add(PipelineStage(run_id=run.id, stage=name, sequence=seq))
    db.flush()

    ordered = (
        db.query(PipelineStage).filter_by(run_id=run.id).order_by(PipelineStage.sequence).all()
    )
    assert [s.stage for s in ordered] == [
        PipelineStageName.PLAN,
        PipelineStageName.COMPANY,
        PipelineStageName.LOCATION,
    ]
