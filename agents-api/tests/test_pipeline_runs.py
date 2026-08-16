"""Run lifecycle: creation, resume and cancel (CAR-157).

The resume tests are acceptance criterion 2 - "re-runs only X onwards, and only
its non-succeeded tasks" - so they assert on what survives a resume as much as
on what it redoes.
"""

import pytest

from app.db.models import PipelineStage, PipelineTask
from app.pipeline.executor import materialize_tasks
from app.pipeline.runs import cancel_run, create_run, ensure_stages, resume_run
from app.pipeline.sequence import STAGE_SEQUENCE
from app.pipeline.stages import (
    PipelineEntityType,
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTaskStatus,
)


class StubRedis:
    def __init__(self):
        self.store = {}

    def setex(self, key, ttl, value):
        self.store[key] = value

    def exists(self, key):
        return 1 if key in self.store else 0

    def delete(self, key):
        self.store.pop(key, None)


@pytest.fixture
def redis():
    return StubRedis()


def _stages(db, run_id):
    rows = db.query(PipelineStage).filter(PipelineStage.run_id == run_id).all()
    return {row.stage: row for row in rows}


class TestCreateRun:
    def test_starts_in_planning(self, db):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING)
        db.flush()
        assert run.status is PipelineRunStatus.PLANNING

    def test_records_the_params_it_was_given(self, db):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING, params={"alumni_ids": ["a"]})
        db.flush()
        assert run.params == {"alumni_ids": ["a"]}


class TestEnsureStages:
    def test_creates_every_stage_in_order(self, db):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING)
        db.flush()

        ensure_stages(db, run)
        db.flush()

        stages = _stages(db, run.id)
        assert set(stages) == set(STAGE_SEQUENCE)
        assert [stages[name].sequence for name in STAGE_SEQUENCE] == list(
            range(len(STAGE_SEQUENCE))
        )

    def test_is_idempotent(self, db):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING)
        db.flush()

        ensure_stages(db, run)
        db.flush()
        ensure_stages(db, run)
        db.flush()

        assert len(_stages(db, run.id)) == len(STAGE_SEQUENCE)


class TestResumeRun:
    @pytest.fixture
    def prepared(self, db):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING)
        db.flush()
        ensure_stages(db, run)
        db.flush()
        stages = _stages(db, run.id)
        for name in STAGE_SEQUENCE:
            stages[name].status = PipelineStageStatus.COMPLETED
        materialize_tasks(
            db, run, stages[PipelineStageName.COMPANY], ["a", "b"], PipelineEntityType.COMPANY
        )
        db.flush()
        tasks = {
            row.entity_id: row
            for row in db.query(PipelineTask)
            .filter(PipelineTask.stage_id == stages[PipelineStageName.COMPANY].id)
            .all()
        }
        tasks["a"].status = PipelineTaskStatus.SUCCEEDED
        tasks["b"].status = PipelineTaskStatus.FAILED
        db.flush()
        return run, stages

    def test_returns_the_stage_to_run(self, db, prepared, redis):
        run, _ = prepared
        assert resume_run(db, run, PipelineStageName.COMPANY, redis) is PipelineStageName.COMPANY

    def test_reopens_the_target_stage_and_everything_after(self, db, prepared, redis):
        run, _ = prepared

        resume_run(db, run, PipelineStageName.COMPANY, redis)
        db.flush()

        stages = _stages(db, run.id)
        for name in (
            PipelineStageName.COMPANY,
            PipelineStageName.CLASSIFY_ROLES,
            PipelineStageName.SENIORITY,
            PipelineStageName.LOCATION,
        ):
            assert stages[name].status is PipelineStageStatus.PENDING

    def test_leaves_earlier_stages_completed(self, db, prepared, redis):
        run, _ = prepared

        resume_run(db, run, PipelineStageName.COMPANY, redis)
        db.flush()

        stages = _stages(db, run.id)
        assert stages[PipelineStageName.PLAN].status is PipelineStageStatus.COMPLETED
        assert stages[PipelineStageName.LINKEDIN].status is PipelineStageStatus.COMPLETED

    def test_does_not_undo_tasks_that_succeeded(self, db, prepared, redis):
        run, stages = prepared

        resume_run(db, run, PipelineStageName.COMPANY, redis)
        db.flush()

        tasks = {
            row.entity_id: row.status
            for row in db.query(PipelineTask)
            .filter(PipelineTask.stage_id == stages[PipelineStageName.COMPANY].id)
            .all()
        }
        assert tasks["a"] is PipelineTaskStatus.SUCCEEDED
        assert tasks["b"] is PipelineTaskStatus.FAILED

    def test_puts_the_run_back_into_running(self, db, prepared, redis):
        run, _ = prepared
        run.status = PipelineRunStatus.FAILED

        resume_run(db, run, PipelineStageName.COMPANY, redis)
        db.flush()

        assert run.status is PipelineRunStatus.RUNNING

    def test_clears_a_previous_cancellation(self, db, prepared, redis):
        # Without this the resumed run stops at its first chunk for a cancel
        # that was already acted on.
        run, _ = prepared
        cancel_run(db, run, redis)
        db.flush()

        resume_run(db, run, PipelineStageName.COMPANY, redis)
        db.flush()

        assert redis.exists(f"pipeline:cancel:{run.id}") == 0


class TestCancelRun:
    def test_sets_the_flag_and_the_status(self, db, redis):
        run = create_run(db, kind=PipelineKind.REFRESH_EXISTING)
        db.flush()

        cancel_run(db, run, redis)
        db.flush()

        assert redis.exists(f"pipeline:cancel:{run.id}") == 1
        assert run.status is PipelineRunStatus.CANCELLED
