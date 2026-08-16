"""Orchestration in the run_stage task (CAR-157).

The executor is covered in test_pipeline_executor; what is tested here is what
run_stage does *around* it - which stage runs next, when the run is finished,
and when nothing should be enqueued at all. That seam was previously only
exercised by hand.

session_scope is patched to hand back the test session, so these run inside the
`db` fixture's transaction rather than against whatever DATABASE_URL points at.
"""

from contextlib import contextmanager

import pytest

from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.pipeline.executor import StageSpec
from app.pipeline.stages import (
    PipelineEntityType,
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTaskStatus,
)
from app.tasks.pipeline import run_stage


@pytest.fixture
def run(db):
    r = PipelineRun(kind=PipelineKind.REFRESH_EXISTING, status=PipelineRunStatus.PLANNING)
    db.add(r)
    db.flush()
    return r


@pytest.fixture
def enqueued(db, monkeypatch):
    """Patch out the process boundaries: session, queue and cancellation."""
    from app.pipeline import control, registry
    from app.tasks.queue import task_queue

    @contextmanager
    def fake_scope():
        yield db

    monkeypatch.setattr("app.db.session.session_scope", fake_scope)

    calls = []

    async def fake_enqueue(task, **kwargs):
        calls.append((task, kwargs))
        return "job-id"

    monkeypatch.setattr(task_queue, "enqueue", fake_enqueue)

    # Otherwise this builds a real Redis client from settings and the network
    # guard trips on a test that has nothing to do with Redis.
    def never_cancelled(run_id, client=None):
        async def check():
            return False

        return check

    monkeypatch.setattr(control, "cancel_checker", never_cancelled)

    async def handle(entity_id):
        return {"handled": entity_id}

    monkeypatch.setitem(
        registry.STAGES,
        PipelineStageName.CLASSIFY_ROLES,
        StageSpec(
            entity_type=PipelineEntityType.ALUMNI,
            resolve=lambda session, r: ["a", "b"],
            handle=handle,
            chunk_size=2,
        ),
    )
    return calls


def _stage(db, run_id, name):
    return (
        db.query(PipelineStage)
        .filter(PipelineStage.run_id == run_id, PipelineStage.stage == name)
        .one()
    )


class TestConvertedStage:
    async def test_runs_the_stage_and_marks_its_tasks(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.CLASSIFY_ROLES.value)

        stage = _stage(db, run.id, PipelineStageName.CLASSIFY_ROLES)
        statuses = {
            row.entity_id: row.status
            for row in db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all()
        }
        assert statuses == {
            "a": PipelineTaskStatus.SUCCEEDED,
            "b": PipelineTaskStatus.SUCCEEDED,
        }

    async def test_enqueues_the_following_stage(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.CLASSIFY_ROLES.value)

        assert enqueued == [
            ("run_stage", {"run_id": run.id, "stage": PipelineStageName.SENIORITY.value})
        ]

    async def test_marks_the_stage_completed(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.CLASSIFY_ROLES.value)

        assert _stage(db, run.id, PipelineStageName.CLASSIFY_ROLES).status is (
            PipelineStageStatus.COMPLETED
        )


class TestUnconvertedStage:
    async def test_is_skipped_rather_than_failed(self, db, run, enqueued):
        # Five of six stages are still on their old coarse tasks. Failing here
        # would strand every run at LINKEDIN and never reach CLASSIFY_ROLES.
        await run_stage(None, run.id, PipelineStageName.LINKEDIN.value)

        assert _stage(db, run.id, PipelineStageName.LINKEDIN).status is (
            PipelineStageStatus.SKIPPED
        )

    async def test_still_advances_the_chain(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.LINKEDIN.value)

        assert enqueued == [
            ("run_stage", {"run_id": run.id, "stage": PipelineStageName.COMPANY.value})
        ]


class TestLastStage:
    async def test_completes_the_run(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.LOCATION.value)

        assert run.status is PipelineRunStatus.COMPLETED
        assert run.finished_at is not None

    async def test_enqueues_nothing_further(self, db, run, enqueued):
        await run_stage(None, run.id, PipelineStageName.LOCATION.value)

        assert enqueued == []


class TestStagesThatDoNotComplete:
    async def test_a_cancelled_stage_does_not_advance_the_chain(
        self, db, run, enqueued, monkeypatch
    ):
        from app.pipeline import control

        def always_cancelled(run_id, client=None):
            async def check():
                return True

            return check

        monkeypatch.setattr(control, "cancel_checker", always_cancelled)

        await run_stage(None, run.id, PipelineStageName.CLASSIFY_ROLES.value)

        assert enqueued == []
        assert run.status is PipelineRunStatus.CANCELLED


class TestMissingRun:
    async def test_reports_cancelled_and_enqueues_nothing(self, db, enqueued):
        # A deleted run must not take the worker down, and must not enqueue a
        # follow-on stage for something that no longer exists.
        outcome = await run_stage(
            None, "00000000-0000-0000-0000-000000000000", PipelineStageName.CLASSIFY_ROLES.value
        )

        assert outcome == "CANCELLED"
        assert enqueued == []
