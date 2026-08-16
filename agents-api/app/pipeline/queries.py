"""Reads and bulk state changes behind the pipeline API.

Kept out of the endpoint module so the routes stay a thin translation layer,
the same split `executor.py` uses to keep its database access in one place.
"""

import logging
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.pipeline.cursor import Cursor, encode_cursor
from app.pipeline.sequence import sequence_of
from app.pipeline.stages import (
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineTaskStatus,
)

logger = logging.getLogger(__name__)

MAX_LIMIT = 100


def _paginate(query, model, limit: int, cursor: Optional[Cursor]):
    """Apply keyset ordering and return one page plus its next cursor.

    One row beyond the limit is fetched rather than counted: a count over the
    task table would be a second full scan on every page.
    """
    if cursor is not None:
        query = query.filter(
            (model.created_at < cursor.created_at)
            | ((model.created_at == cursor.created_at) & (model.id < cursor.id))
        )

    rows = query.order_by(model.created_at.desc(), model.id.desc()).limit(limit + 1).all()

    if len(rows) <= limit:
        return rows, None

    page = rows[:limit]
    last = page[-1]
    return page, encode_cursor(Cursor(created_at=last.created_at, id=last.id))


def list_runs(
    session: Session,
    limit: int,
    cursor: Optional[Cursor] = None,
    kind: Optional[PipelineKind] = None,
    status: Optional[PipelineRunStatus] = None,
) -> Tuple[List[PipelineRun], Optional[str]]:
    query = session.query(PipelineRun)
    if kind is not None:
        query = query.filter(PipelineRun.kind == kind)
    if status is not None:
        query = query.filter(PipelineRun.status == status)
    return _paginate(query, PipelineRun, limit, cursor)


def list_tasks(
    session: Session,
    run_id: str,
    limit: int,
    cursor: Optional[Cursor] = None,
    status: Optional[PipelineTaskStatus] = None,
    stage: Optional[PipelineStageName] = None,
) -> Tuple[List[PipelineTask], Optional[str]]:
    query = (
        session.query(PipelineTask)
        .join(PipelineStage, PipelineTask.stage_id == PipelineStage.id)
        .filter(PipelineStage.run_id == run_id)
    )
    if status is not None:
        query = query.filter(PipelineTask.status == status)
    if stage is not None:
        query = query.filter(PipelineStage.stage == stage)
    return _paginate(query, PipelineTask, limit, cursor)


def run_stages(session: Session, run_id: str) -> List[PipelineStage]:
    return (
        session.query(PipelineStage)
        .filter(PipelineStage.run_id == run_id)
        .order_by(PipelineStage.sequence)
        .all()
    )


def _empty_counts() -> dict:
    return {"total": 0, "succeeded": 0, "failed": 0, "skipped": 0, "pending": 0}


def run_task_counts_bulk(session: Session, run_ids: List[str]) -> dict:
    """Count tasks by status for several runs in one query.

    Counted from the task rows rather than summed from PipelineStage's
    counters: those are written by the executor, so a run that has been created
    but not yet executed would report zero tasks while plainly having them. One
    grouped query rather than one per run keeps the list endpoint off N+1.
    """
    counts = {run_id: _empty_counts() for run_id in run_ids}
    if not run_ids:
        return counts

    rows = (
        session.query(PipelineStage.run_id, PipelineTask.status, func.count())
        .join(PipelineTask, PipelineTask.stage_id == PipelineStage.id)
        .filter(PipelineStage.run_id.in_(run_ids))
        .group_by(PipelineStage.run_id, PipelineTask.status)
        .all()
    )

    for run_id, task_status, count in rows:
        entry = counts[run_id]
        entry["total"] += count
        if task_status is PipelineTaskStatus.SUCCEEDED:
            entry["succeeded"] += count
        elif task_status is PipelineTaskStatus.FAILED:
            entry["failed"] += count
        elif task_status is PipelineTaskStatus.SKIPPED:
            entry["skipped"] += count
        else:
            entry["pending"] += count

    return counts


def run_task_counts(session: Session, run_id: str) -> dict:
    return run_task_counts_bulk(session, [run_id])[run_id]


def requeue_failed_tasks(session: Session, run_id: str) -> Optional[PipelineStageName]:
    """Return FAILED tasks to QUEUED and report the earliest stage to re-run.

    Only FAILED moves. SUCCEEDED is the double-spend this endpoint exists to
    avoid, and SKIPPED is a decision already taken about that entity.
    """
    stages = {stage.id: stage for stage in run_stages(session, run_id)}
    if not stages:
        return None

    failed = (
        session.query(PipelineTask)
        .filter(
            PipelineTask.stage_id.in_(stages.keys()),
            PipelineTask.status == PipelineTaskStatus.FAILED,
        )
        .all()
    )
    if not failed:
        return None

    for task in failed:
        task.status = PipelineTaskStatus.QUEUED
        task.error = None
        task.finished_at = None

    earliest = min((stages[task.stage_id].stage for task in failed), key=sequence_of)
    logger.info("Requeued %s failed task(s) on run %s from %s", len(failed), run_id, earliest)
    return earliest
