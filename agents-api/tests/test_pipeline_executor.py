"""Executor behaviour against a real database (CAR-157).

These use the `db` fixture, so they need Postgres with the Prisma schema applied
and are skipped locally without it. The behaviour under test *is* the rows -
whether a resume reuses them, whether a crash leaves them recoverable - so
stubbing the database out would test nothing.
"""

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import event

from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.pipeline.executor import (
    StageSpec,
    count_tasks,
    execute_stage,
    materialize_tasks,
    pending_entity_ids,
)
from app.pipeline.keys import idempotency_key
from app.pipeline.recovery import recover_stuck_tasks
from app.pipeline.stages import (
    PipelineEntityType,
    PipelineKind,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTaskStatus,
)
from app.pipeline.state import StageOutcome


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


def _statuses(db, stage_id):
    rows = db.query(PipelineTask).filter(PipelineTask.stage_id == stage_id).all()
    return {row.entity_id: row.status for row in rows}


class TestMaterializeTasks:
    def test_creates_one_queued_task_per_entity(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a", "b", "c"], PipelineEntityType.ALUMNI)
        db.flush()

        assert _statuses(db, stage.id) == {
            "a": PipelineTaskStatus.QUEUED,
            "b": PipelineTaskStatus.QUEUED,
            "c": PipelineTaskStatus.QUEUED,
        }

    def test_derives_the_shared_idempotency_key(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()

        task = db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).one()
        assert task.idempotency_key == idempotency_key(
            run.id, PipelineStageName.CLASSIFY_ROLES, "a"
        )

    def test_is_idempotent(self, db, run, stage):
        # A resumed stage re-materializes before running. Without ON CONFLICT
        # this raises on the unique constraint and the resume dies on contact.
        materialize_tasks(db, run, stage, ["a", "b"], PipelineEntityType.ALUMNI)
        db.flush()
        created = materialize_tasks(db, run, stage, ["a", "b"], PipelineEntityType.ALUMNI)
        db.flush()

        assert created == 0
        assert len(_statuses(db, stage.id)) == 2

    def test_does_not_reset_work_that_already_succeeded(self, db, run, stage):
        # The whole point of resume-at-stage: re-materializing must not drag a
        # finished task back to QUEUED and pay for it twice.
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        task = db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).one()
        task.status = PipelineTaskStatus.SUCCEEDED
        db.flush()

        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()

        assert _statuses(db, stage.id) == {"a": PipelineTaskStatus.SUCCEEDED}

    def test_adds_only_the_new_entities(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        created = materialize_tasks(db, run, stage, ["a", "b"], PipelineEntityType.ALUMNI)
        db.flush()

        assert created == 1
        assert set(_statuses(db, stage.id)) == {"a", "b"}


class TestCountTasks:
    def test_counts_by_status(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a", "b", "c", "d"], PipelineEntityType.ALUMNI)
        db.flush()
        rows = db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all()
        by_entity = {row.entity_id: row for row in rows}
        by_entity["a"].status = PipelineTaskStatus.SUCCEEDED
        by_entity["b"].status = PipelineTaskStatus.FAILED
        by_entity["c"].status = PipelineTaskStatus.SKIPPED
        db.flush()

        counts = count_tasks(db, stage.id)

        assert (counts.total, counts.succeeded, counts.failed, counts.skipped) == (4, 1, 1, 1)
        assert counts.pending == 1

    def test_an_empty_stage_counts_zero(self, db, stage):
        assert count_tasks(db, stage.id).total == 0


class TestPendingEntityIds:
    def test_excludes_succeeded_entities(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a", "b"], PipelineEntityType.ALUMNI)
        db.flush()
        rows = db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all()
        {row.entity_id: row for row in rows}["a"].status = PipelineTaskStatus.SUCCEEDED
        db.flush()

        assert pending_entity_ids(db, stage.id) == ["b"]

    def test_includes_failed_entities_so_a_resume_retries_them(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        db.query(PipelineTask).filter(
            PipelineTask.stage_id == stage.id
        ).one().status = PipelineTaskStatus.FAILED
        db.flush()

        assert pending_entity_ids(db, stage.id) == ["a"]

    def test_excludes_skipped_entities(self, db, run, stage):
        # SKIPPED is a decision already taken about that entity, not unfinished
        # work. Retrying it would re-litigate the decision on every resume.
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        db.query(PipelineTask).filter(
            PipelineTask.stage_id == stage.id
        ).one().status = PipelineTaskStatus.SKIPPED
        db.flush()

        assert pending_entity_ids(db, stage.id) == []


class TestExecuteStage:
    def _spec(self, handle, chunk_size=2):
        return StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: ["a", "b", "c", "d"],
            handle=handle,
            chunk_size=chunk_size,
        )

    async def test_marks_each_handled_entity_succeeded(self, db, run, stage):
        async def handle(entity_id):
            return {"seen": entity_id}

        outcome = await execute_stage(db, run, stage, self._spec(handle))

        assert outcome is StageOutcome.COMPLETE
        assert set(_statuses(db, stage.id).values()) == {PipelineTaskStatus.SUCCEEDED}

    async def test_records_the_handler_result_on_the_task(self, db, run, stage):
        # CAR-155 sized `result` to hold what the model decided, which is the
        # baseline CAR-106 and CAR-108 need to prove an improvement against.
        async def handle(entity_id):
            return {"esco": "2512.3", "confidence": 0.91}

        await execute_stage(db, run, stage, self._spec(handle))

        task = db.query(PipelineTask).filter(PipelineTask.entity_id == "a").one()
        assert task.result == {"esco": "2512.3", "confidence": 0.91}

    async def test_a_failing_entity_does_not_stop_the_others(self, db, run, stage):
        async def handle(entity_id):
            if entity_id == "b":
                raise RuntimeError("provider blew up")
            return None

        await execute_stage(db, run, stage, self._spec(handle))

        statuses = _statuses(db, stage.id)
        assert statuses["b"] is PipelineTaskStatus.FAILED
        assert statuses["a"] is PipelineTaskStatus.SUCCEEDED
        assert statuses["d"] is PipelineTaskStatus.SUCCEEDED

    async def test_records_why_a_task_failed(self, db, run, stage):
        async def handle(entity_id):
            raise RuntimeError("provider blew up")

        await execute_stage(db, run, stage, self._spec(handle))

        task = db.query(PipelineTask).filter(PipelineTask.entity_id == "a").one()
        assert "provider blew up" in task.error

    async def test_counts_are_flushed_to_the_stage_row(self, db, run, stage):
        async def handle(entity_id):
            if entity_id == "b":
                raise RuntimeError("nope")
            return None

        await execute_stage(db, run, stage, self._spec(handle))

        db.refresh(stage)
        assert (stage.succeeded_count, stage.failed_count, stage.total_count) == (3, 1, 4)

    async def test_does_not_rerun_entities_that_already_succeeded(self, db, run, stage):
        attempted = []

        async def handle(entity_id):
            attempted.append(entity_id)
            return None

        materialize_tasks(db, run, stage, ["a", "b", "c", "d"], PipelineEntityType.ALUMNI)
        db.flush()
        db.query(PipelineTask).filter(
            PipelineTask.entity_id == "a"
        ).one().status = PipelineTaskStatus.SUCCEEDED
        db.flush()

        await execute_stage(db, run, stage, self._spec(handle))

        assert "a" not in attempted
        assert set(attempted) == {"b", "c", "d"}

    async def test_stops_when_cancelled_between_chunks(self, db, run, stage):
        attempted = []

        async def handle(entity_id):
            attempted.append(entity_id)
            return None

        # Cancelled once the first chunk of two has been handled.
        async def is_cancelled():
            return len(attempted) >= 2

        outcome = await execute_stage(db, run, stage, self._spec(handle), is_cancelled=is_cancelled)

        assert outcome is StageOutcome.CANCELLED
        assert len(attempted) == 2
        assert _statuses(db, stage.id)["d"] is PipelineTaskStatus.QUEUED

    async def test_aborts_once_the_failure_threshold_is_exceeded(self, db, run, stage):
        attempted = []

        async def handle(entity_id):
            attempted.append(entity_id)
            raise RuntimeError("everything is failing")

        entity_ids = [str(i) for i in range(100)]
        spec = StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: entity_ids,
            handle=handle,
            chunk_size=25,
        )

        outcome = await execute_stage(db, run, stage, spec)

        # Stopped at a chunk boundary rather than grinding through all 100.
        assert outcome is StageOutcome.ABORT_THRESHOLD
        assert len(attempted) < len(entity_ids)

    async def test_an_aborted_stage_records_the_reason(self, db, run, stage):
        async def handle(entity_id):
            raise RuntimeError("everything is failing")

        spec = StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: [str(i) for i in range(100)],
            handle=handle,
            chunk_size=25,
        )

        await execute_stage(db, run, stage, spec)

        db.refresh(stage)
        assert stage.status is PipelineStageStatus.FAILED
        assert stage.error is not None and "threshold" in stage.error.lower()


class TestRunningMarker:
    async def test_marks_a_chunk_running_before_handling_it(self, db, run, stage):
        seen = {}

        async def handle(entity_id):
            seen[entity_id] = (
                db.query(PipelineTask).filter(PipelineTask.entity_id == entity_id).one().status
            )
            return None

        spec = StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: ["a", "b"],
            handle=handle,
            chunk_size=2,
        )
        await execute_stage(db, run, stage, spec)

        # Without this the crash-recovery sweep has nothing to find: a killed
        # worker would leave rows in QUEUED, indistinguishable from work that
        # was never started.
        assert seen == {"a": PipelineTaskStatus.RUNNING, "b": PipelineTaskStatus.RUNNING}

    async def test_only_the_current_chunk_is_marked_running(self, db, run, stage):
        seen = []

        async def handle(entity_id):
            seen.append(db.query(PipelineTask).filter(PipelineTask.entity_id == "d").one().status)
            return None

        spec = StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: ["a", "b", "c", "d"],
            handle=handle,
            chunk_size=2,
        )
        await execute_stage(db, run, stage, spec)

        # While the first chunk runs, "d" is still queued.
        assert seen[0] is PipelineTaskStatus.QUEUED


class TestRecoverStuckTasks:
    def test_resets_tasks_left_running_by_a_dead_worker(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        task = db.query(PipelineTask).filter(PipelineTask.entity_id == "a").one()
        task.status = PipelineTaskStatus.RUNNING
        task.started_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=9)
        db.flush()

        reset = recover_stuck_tasks(db, timeout=timedelta(hours=8))
        db.flush()

        assert reset == 1
        assert _statuses(db, stage.id)["a"] is PipelineTaskStatus.QUEUED

    def test_leaves_tasks_that_are_still_within_the_timeout(self, db, run, stage):
        # A long-running stage is normal here - request_role_location sleeps 60s
        # between batches. Resetting live work would double-process it.
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        task = db.query(PipelineTask).filter(PipelineTask.entity_id == "a").one()
        task.status = PipelineTaskStatus.RUNNING
        task.started_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=5)
        db.flush()

        assert recover_stuck_tasks(db, timeout=timedelta(hours=8)) == 0

    def test_leaves_terminal_tasks_alone(self, db, run, stage):
        materialize_tasks(db, run, stage, ["a"], PipelineEntityType.ALUMNI)
        db.flush()
        task = db.query(PipelineTask).filter(PipelineTask.entity_id == "a").one()
        task.status = PipelineTaskStatus.SUCCEEDED
        task.started_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=2)
        db.flush()

        assert recover_stuck_tasks(db, timeout=timedelta(hours=8)) == 0
        assert _statuses(db, stage.id)["a"] is PipelineTaskStatus.SUCCEEDED


class TestDurability:
    """session_scope does not commit (app/db/session.py), so the executor must.

    Without this every status write is discarded when the worker's session
    closes, and a killed worker resumes from nothing - which defeats the whole
    ticket. The `db` fixture cannot see the difference, because flushed and
    committed state look identical inside its outer transaction; listening for
    real commit events is what distinguishes them.
    """

    async def test_commits_at_chunk_boundaries(self, db, run, stage):
        commits = []
        event.listen(db, "after_commit", lambda s: commits.append(1))

        async def handle(entity_id):
            return None

        spec = StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, run: ["a", "b", "c", "d"],
            handle=handle,
            chunk_size=2,
        )
        await execute_stage(db, run, stage, spec)

        # Two chunks, so progress must be durable at least twice - not once at
        # the end, which would lose a whole stage to a kill.
        assert len(commits) >= 2
