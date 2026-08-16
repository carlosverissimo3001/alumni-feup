"""Run lifecycle: create, resume, cancel.

CAR-159 puts HTTP endpoints in front of `resume_run` and `cancel_run`; they are
functions here so that the two tickets do not both own the same behaviour.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from redis import Redis
from sqlalchemy.orm import Session

from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.pipeline.control import clear_cancel, request_cancel
from app.pipeline.sequence import STAGE_SEQUENCE, sequence_of
from app.pipeline.stages import (
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTaskStatus,
    PipelineTrigger,
)
from app.pipeline.state import resume_targets

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_run(
    session: Session,
    kind: PipelineKind,
    params: Optional[Dict[str, Any]] = None,
    trigger_source: PipelineTrigger = PipelineTrigger.API,
    triggered_by: Optional[str] = None,
) -> PipelineRun:
    run = PipelineRun(
        kind=kind,
        status=PipelineRunStatus.PLANNING,
        params=params,
        trigger_source=trigger_source,
        triggered_by=triggered_by,
    )
    session.add(run)
    return run


def ensure_stages(session: Session, run: PipelineRun) -> Dict[PipelineStageName, PipelineStage]:
    """Create the run's stage rows, one per stage in the sequence.

    Rows for every stage exist from the start even though their tasks do not:
    the status endpoints in CAR-159 need something to report progress against
    before a stage has been reached.
    """
    existing = {
        row.stage: row
        for row in session.query(PipelineStage).filter(PipelineStage.run_id == run.id).all()
    }

    for stage_name in STAGE_SEQUENCE:
        if stage_name in existing:
            continue
        row = PipelineStage(
            run_id=run.id,
            stage=stage_name,
            sequence=sequence_of(stage_name),
            status=PipelineStageStatus.PENDING,
        )
        session.add(row)
        existing[stage_name] = row

    session.flush()
    return existing


def resume_run(
    session: Session,
    run: PipelineRun,
    from_stage: PipelineStageName,
    redis_client: Optional[Redis] = None,
) -> PipelineStageName:
    """Reopen `from_stage` onwards and report which stage to enqueue.

    Task rows are deliberately left as they are. The executor already skips
    SUCCEEDED and SKIPPED and retries the rest, so resetting them here would
    only discard the record of what the previous attempt achieved.
    """
    targets = resume_targets(from_stage)
    stages = ensure_stages(session, run)

    for stage_name in targets:
        stage = stages[stage_name]
        stage.status = PipelineStageStatus.PENDING
        stage.error = None
        stage.finished_at = None

    run.status = PipelineRunStatus.RUNNING
    run.error = None
    run.finished_at = None
    run.started_at = run.started_at or _now()

    clear_cancel(run.id, redis_client)
    # Committed rather than flushed: session_scope does not commit, and a
    # resume that is rolled back leaves the run looking failed while its stage
    # job is already queued.
    session.commit()

    logger.info("Run %s resumed from %s", run.id, from_stage.value)
    return from_stage


def cancel_run(
    session: Session, run: PipelineRun, redis_client: Optional[Redis] = None
) -> None:
    """Ask the executor to stop at its next chunk boundary.

    The flag is set before the status so that a worker reading it mid-stage
    cannot miss the cancel and then find the run already marked cancelled.
    """
    request_cancel(run.id, redis_client)

    run.status = PipelineRunStatus.CANCELLED
    run.finished_at = _now()
    session.commit()


def stage_row(
    session: Session, run: PipelineRun, stage_name: PipelineStageName
) -> PipelineStage:
    return (
        session.query(PipelineStage)
        .filter(PipelineStage.run_id == run.id, PipelineStage.stage == stage_name)
        .one()
    )


def has_unfinished_tasks(session: Session, stage: PipelineStage) -> bool:
    return (
        session.query(PipelineTask)
        .filter(
            PipelineTask.stage_id == stage.id,
            PipelineTask.status.in_(
                (
                    PipelineTaskStatus.QUEUED,
                    PipelineTaskStatus.RUNNING,
                    PipelineTaskStatus.FAILED,
                )
            ),
        )
        .count()
        > 0
    )
