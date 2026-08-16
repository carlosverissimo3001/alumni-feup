"""The shell around the stage machine: rows in, services driven, status out.

The only module in `app.pipeline` that knows about the database. Everything it
decides it delegates to `state`, which is pure - so the rules stay testable
without infrastructure and this file stays testable without mocking the rules.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, List, Optional, Sequence

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.pipeline.keys import idempotency_key
from app.pipeline.stages import (
    PipelineEntityType,
    PipelineRunStatus,
    PipelineStageStatus,
    PipelineTaskStatus,
)
from app.pipeline.state import StageOutcome, TaskCounts, should_abort, stage_outcome

logger = logging.getLogger(__name__)

# A resume re-runs these; a stage never revisits the rest.
RESUMABLE_STATUSES = (
    PipelineTaskStatus.QUEUED,
    PipelineTaskStatus.RUNNING,
    PipelineTaskStatus.FAILED,
)

# Matches the BATCH_SIZE the services already fan out at, so converting a stage
# does not change how hard it hits the providers.
DEFAULT_CHUNK_SIZE = 50

DEFAULT_FAILURE_THRESHOLD = 0.2


@dataclass(frozen=True)
class StageSpec:
    """What a stage needs beyond the machinery: its entities and its work.

    Per-stage differences live here rather than in branches inside the executor,
    so converting the remaining five stages is one entry each.
    """

    entity_type: PipelineEntityType
    resolve: Callable[[Session, PipelineRun], Sequence[str]]
    handle: Callable[[str], Awaitable[Optional[Dict[str, Any]]]]
    chunk_size: int = DEFAULT_CHUNK_SIZE
    metadata: Dict[str, Any] = field(default_factory=dict)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def failure_threshold(run: PipelineRun) -> float:
    params = run.params or {}
    return float(params.get("failure_threshold", DEFAULT_FAILURE_THRESHOLD))


def materialize_tasks(
    session: Session,
    run: PipelineRun,
    stage: PipelineStage,
    entity_ids: Sequence[str],
    entity_type: PipelineEntityType,
) -> int:
    """Create the stage's task rows, returning how many were new.

    ON CONFLICT DO NOTHING rather than a read-then-insert: the unique constraint
    is the arbiter, so a resume racing the original worker cannot produce two
    rows for the same entity.
    """
    if not entity_ids:
        return 0

    rows = [
        {
            "stage_id": stage.id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "status": PipelineTaskStatus.QUEUED,
            "idempotency_key": idempotency_key(run.id, stage.stage, entity_id),
        }
        for entity_id in entity_ids
    ]

    statement = (
        insert(PipelineTask)
        .values(rows)
        .on_conflict_do_nothing(index_elements=[PipelineTask.idempotency_key])
    )
    return session.execute(statement).rowcount


def count_tasks(session: Session, stage_id: str) -> TaskCounts:
    """Tally the stage's rows into the shape the transition rules expect."""
    grouped = dict(
        session.query(PipelineTask.status, func.count())
        .filter(PipelineTask.stage_id == stage_id)
        .group_by(PipelineTask.status)
        .all()
    )
    return TaskCounts(
        total=sum(grouped.values()),
        succeeded=grouped.get(PipelineTaskStatus.SUCCEEDED, 0),
        failed=grouped.get(PipelineTaskStatus.FAILED, 0),
        skipped=grouped.get(PipelineTaskStatus.SKIPPED, 0),
    )


def pending_entity_ids(session: Session, stage_id: str) -> List[str]:
    """The entities a run of this stage should attempt.

    SUCCEEDED is excluded because redoing it is the cost resume exists to avoid;
    SKIPPED because that decision was already taken about the entity.
    """
    rows = (
        session.query(PipelineTask.entity_id)
        .filter(
            PipelineTask.stage_id == stage_id,
            PipelineTask.status.in_(RESUMABLE_STATUSES),
        )
        .order_by(PipelineTask.entity_id)
        .all()
    )
    return [row[0] for row in rows]


def _chunks(items: List[str], size: int):
    for start in range(0, len(items), size):
        yield items[start : start + size]


def _flush_counts(session: Session, stage: PipelineStage, counts: TaskCounts) -> None:
    stage.total_count = counts.total
    stage.succeeded_count = counts.succeeded
    stage.failed_count = counts.failed
    stage.skipped_count = counts.skipped
    session.flush()


def _mark_running(session: Session, stage_id: str, entity_ids: List[str]) -> None:
    """Claim a chunk before working it.

    One statement for the whole chunk. Without it a killed worker leaves its
    in-flight rows in QUEUED, where the recovery sweep cannot tell them apart
    from work that was never started.
    """
    session.query(PipelineTask).filter(
        PipelineTask.stage_id == stage_id,
        PipelineTask.entity_id.in_(entity_ids),
    ).update(
        {PipelineTask.status: PipelineTaskStatus.RUNNING, PipelineTask.started_at: _now()},
        synchronize_session=False,
    )
    session.flush()


def _finish_task(
    session: Session,
    stage_id: str,
    entity_id: str,
    status: PipelineTaskStatus,
    result: Optional[Dict[str, Any]],
    error: Optional[str],
) -> None:
    task = (
        session.query(PipelineTask)
        .filter(PipelineTask.stage_id == stage_id, PipelineTask.entity_id == entity_id)
        .one()
    )
    task.status = status
    task.result = result
    task.error = error
    task.attempts = (task.attempts or 0) + 1
    task.finished_at = _now()


async def execute_stage(
    session: Session,
    run: PipelineRun,
    stage: PipelineStage,
    spec: StageSpec,
    is_cancelled: Optional[Callable[[], Awaitable[bool]]] = None,
) -> StageOutcome:
    """Drive one stage to a terminal outcome.

    Re-materializes before running so that a resume and a first run take the
    same path - the unique constraint absorbs the rows that already exist.
    """
    threshold = failure_threshold(run)

    materialize_tasks(session, run, stage, spec.resolve(session, run), spec.entity_type)
    session.flush()

    stage.status = PipelineStageStatus.RUNNING
    stage.started_at = stage.started_at or _now()
    _flush_counts(session, stage, count_tasks(session, stage.id))

    for chunk in _chunks(pending_entity_ids(session, stage.id), spec.chunk_size):
        if is_cancelled is not None and await is_cancelled():
            run.status = PipelineRunStatus.CANCELLED
            run.finished_at = _now()
            session.flush()
            logger.info("Run %s cancelled during stage %s", run.id, stage.stage)
            return StageOutcome.CANCELLED

        _mark_running(session, stage.id, chunk)

        outcomes = await asyncio.gather(
            *(spec.handle(entity_id) for entity_id in chunk), return_exceptions=True
        )

        for entity_id, outcome in zip(chunk, outcomes):
            if isinstance(outcome, BaseException):
                logger.warning(
                    "Stage %s failed on %s: %s", stage.stage, entity_id, outcome
                )
                _finish_task(
                    session,
                    stage.id,
                    entity_id,
                    PipelineTaskStatus.FAILED,
                    None,
                    f"{type(outcome).__name__}: {outcome}",
                )
            else:
                _finish_task(
                    session, stage.id, entity_id, PipelineTaskStatus.SUCCEEDED, outcome, None
                )

        counts = count_tasks(session, stage.id)
        _flush_counts(session, stage, counts)

        # Evaluated per chunk rather than at the end: the point is to stop
        # paying for a provider that is down, not to report it afterwards.
        if should_abort(counts, threshold):
            stage.status = PipelineStageStatus.FAILED
            stage.finished_at = _now()
            stage.error = (
                f"Aborted: {counts.failed}/{counts.terminal} tasks failed, "
                f"over the {threshold:.0%} failure threshold"
            )
            run.status = PipelineRunStatus.FAILED
            run.error = f"Stage {stage.stage.value} exceeded its failure threshold"
            run.finished_at = _now()
            session.flush()
            return StageOutcome.ABORT_THRESHOLD

    counts = count_tasks(session, stage.id)
    _flush_counts(session, stage, counts)
    outcome = stage_outcome(counts, threshold)

    if outcome is StageOutcome.COMPLETE:
        stage.status = PipelineStageStatus.COMPLETED
        stage.finished_at = _now()
        session.flush()

    return outcome
