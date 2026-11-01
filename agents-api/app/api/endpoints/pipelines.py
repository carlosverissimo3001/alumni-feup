"""Status and control over pipeline runs.

Shaped so the phase-2 admin UI is additive: list, detail, drill, act. Sessions
arrive via `Depends(get_db)` rather than being opened in the handler, so the
request owns the transaction and tests can substitute one.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PipelineRun, PipelineStage, PipelineTask
from app.db.session import get_db
from app.pipeline import queries
from app.pipeline.cursor import decode_cursor
from app.pipeline.runs import cancel_run, create_run, ensure_stages, resume_run
from app.pipeline.sequence import STAGE_SEQUENCE
from app.pipeline.stages import (
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineTaskStatus,
    PipelineTrigger,
)
from app.schemas.pipeline import (
    CreateRunRequest,
    Page,
    RunAction,
    RunCreated,
    RunDetail,
    RunPreflight,
    RunSummary,
    StageSummary,
    TaskCountsOut,
    TaskSummary,
)
from app.tasks.queue import task_queue
from app.utils.alumni_db import count_all

router = APIRouter()
logger = logging.getLogger(__name__)

DEFAULT_LIMIT = 25


def _cursor_or_400(raw: Optional[str]):
    if raw is None:
        return None
    try:
        return decode_cursor(raw)
    except ValueError as exc:
        # A stale or hand-written cursor is the client's mistake; letting the
        # ValueError escape would report it as a server error instead.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid cursor: {exc}"
        ) from exc


def _run_or_404(session: Session, run_id: str) -> PipelineRun:
    run = session.get(PipelineRun, run_id)
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run {run_id} not found")
    return run


def _summary(run: PipelineRun, counts: dict) -> RunSummary:
    return RunSummary(
        id=run.id,
        kind=run.kind,
        status=run.status,
        trigger_source=run.trigger_source,
        triggered_by=run.triggered_by,
        params=run.params,
        created_at=run.created_at,
        started_at=run.started_at,
        finished_at=run.finished_at,
        error=run.error,
        counts=TaskCountsOut(**counts),
    )


def _stage_summary(stage: PipelineStage) -> StageSummary:
    return StageSummary(
        stage=stage.stage,
        sequence=stage.sequence,
        status=stage.status,
        total_count=stage.total_count,
        succeeded_count=stage.succeeded_count,
        failed_count=stage.failed_count,
        skipped_count=stage.skipped_count,
        started_at=stage.started_at,
        finished_at=stage.finished_at,
        error=stage.error,
    )


def _task_summary(task: PipelineTask) -> TaskSummary:
    return TaskSummary(
        id=task.id,
        entity_type=task.entity_type,
        entity_id=task.entity_id,
        status=task.status,
        attempts=task.attempts,
        error=task.error,
        result=task.result,
        started_at=task.started_at,
        finished_at=task.finished_at,
    )


def _parsed_alumni_ids(body: CreateRunRequest) -> list:
    return [piece.strip() for piece in (body.alumni_ids or "").split(",") if piece.strip()]


def _resolved_scope(body: CreateRunRequest, db: Session) -> int:
    """How many alumni this request would resolve to.

    Mirrors registry._resolve_alumni's branching so the count reported here -
    for preflight and for the 400 this raises - matches what the run would
    actually be scoped to.
    """
    ids = _parsed_alumni_ids(body)
    return len(set(ids)) if ids else count_all(db)


def _requires_confirmation(body: CreateRunRequest, resolved_count: int) -> bool:
    if not _parsed_alumni_ids(body):
        return True
    return resolved_count > settings.PIPELINE_RUN_SIZE_CAP


@router.post(
    "/{kind}/runs/preflight",
    response_model=RunPreflight,
    summary="Resolve the scope a run would cover, without creating or enqueueing it",
)
def preflight_pipeline_run(
    kind: PipelineKind,
    body: CreateRunRequest,
    db: Session = Depends(get_db),
) -> RunPreflight:
    resolved_count = _resolved_scope(body, db)
    return RunPreflight(
        resolved_count=resolved_count,
        cap=settings.PIPELINE_RUN_SIZE_CAP,
        requires_confirmation=_requires_confirmation(body, resolved_count),
    )


@router.post(
    "/{kind}/runs",
    response_model=RunCreated,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Create a run and start it",
)
async def create_pipeline_run(
    kind: PipelineKind,
    body: CreateRunRequest,
    db: Session = Depends(get_db),
) -> RunCreated:
    resolved_count = _resolved_scope(body, db)
    if _requires_confirmation(body, resolved_count) and not body.confirm_all_alumni:
        # CAR-465: an empty/missing alumni_ids silently scoped to the whole
        # table, which already caused a real production-cost incident. Reject
        # rather than guess at intent; GET /{kind}/runs/preflight tells a
        # caller the count before they decide to confirm it.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This request would resolve to {resolved_count} alumni, above the "
                f"{settings.PIPELINE_RUN_SIZE_CAP} cap or with alumni_ids omitted. "
                "Pass confirm_all_alumni=true to proceed, or narrow alumni_ids."
            ),
        )

    # trigger_source/triggered_by have their own PipelineRun columns, so they're
    # excluded here rather than duplicated inside the params JSONB blob.
    params = body.model_dump(exclude_none=True, exclude={"trigger_source", "triggered_by"})

    run = create_run(
        db,
        kind=kind,
        params=params or None,
        trigger_source=body.trigger_source or PipelineTrigger.API,
        triggered_by=body.triggered_by,
    )
    db.flush()
    ensure_stages(db, run)
    run_id = run.id
    # get_db does not commit, and the worker resolves the run by id.
    db.commit()

    await task_queue.enqueue("run_stage", run_id=run_id, stage=STAGE_SEQUENCE[0].value)
    return RunCreated(run_id=run_id)


@router.get("/runs", response_model=Page[RunSummary], summary="List runs")
def list_runs(
    db: Session = Depends(get_db),
    kind: Optional[PipelineKind] = None,
    status_filter: Optional[PipelineRunStatus] = Query(None, alias="status"),
    cursor: Optional[str] = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=queries.MAX_LIMIT),
) -> Page[RunSummary]:
    runs, next_cursor = queries.list_runs(
        db, limit=limit, cursor=_cursor_or_400(cursor), kind=kind, status=status_filter
    )
    counts = queries.run_task_counts_bulk(db, [run.id for run in runs])
    return Page[RunSummary](
        items=[_summary(run, counts[run.id]) for run in runs], next_cursor=next_cursor
    )


@router.get("/runs/{run_id}", response_model=RunDetail, summary="Run detail")
def get_run(run_id: str, db: Session = Depends(get_db)) -> RunDetail:
    run = _run_or_404(db, run_id)
    return RunDetail(
        **_summary(run, queries.run_task_counts(db, run_id)).model_dump(),
        stages=[_stage_summary(stage) for stage in queries.run_stages(db, run_id)],
    )


@router.get(
    "/runs/{run_id}/tasks",
    response_model=Page[TaskSummary],
    summary="Tasks in a run",
)
def list_run_tasks(
    run_id: str,
    db: Session = Depends(get_db),
    status_filter: Optional[PipelineTaskStatus] = Query(None, alias="status"),
    stage: Optional[PipelineStageName] = None,
    cursor: Optional[str] = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=queries.MAX_LIMIT),
) -> Page[TaskSummary]:
    _run_or_404(db, run_id)
    tasks, next_cursor = queries.list_tasks(
        db,
        run_id,
        limit=limit,
        cursor=_cursor_or_400(cursor),
        status=status_filter,
        stage=stage,
    )
    return Page[TaskSummary](items=[_task_summary(task) for task in tasks], next_cursor=next_cursor)


@router.post(
    "/runs/{run_id}/retry",
    response_model=RunAction,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Re-run only the tasks that failed",
)
async def retry_run(run_id: str, db: Session = Depends(get_db)) -> RunAction:
    run = _run_or_404(db, run_id)

    earliest = queries.requeue_failed_tasks(db, run.id)
    if earliest is None:
        return RunAction(run_id=run.id, enqueued_stage=None)

    run.status = PipelineRunStatus.RUNNING
    run.error = None
    run.finished_at = None
    db.commit()

    await task_queue.enqueue("run_stage", run_id=run.id, stage=earliest.value)
    return RunAction(run_id=run.id, enqueued_stage=earliest)


@router.post(
    "/runs/{run_id}/resume",
    response_model=RunAction,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Reopen a stage and everything after it",
)
async def resume(
    run_id: str,
    from_stage: PipelineStageName = Query(..., description="Stage to resume from"),
    db: Session = Depends(get_db),
) -> RunAction:
    run = _run_or_404(db, run_id)

    stage = resume_run(db, run, from_stage)

    await task_queue.enqueue("run_stage", run_id=run.id, stage=stage.value)
    return RunAction(run_id=run.id, enqueued_stage=stage)


@router.post(
    "/runs/{run_id}/cancel",
    response_model=RunAction,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Stop a run at its next chunk boundary",
)
def cancel(run_id: str, db: Session = Depends(get_db)) -> RunAction:
    run = _run_or_404(db, run_id)
    cancel_run(db, run)
    return RunAction(run_id=run.id, enqueued_stage=None)
