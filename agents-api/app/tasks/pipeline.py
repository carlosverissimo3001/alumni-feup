"""Task functions run by the arq worker.

Each is a thin wrapper over the service that already does the work. The
services keep their own semaphores, rate limiting and session scoping - this
layer only decides what runs, when, and how often it retries.

Deliberately thin: the previous BackgroundTasks call sites invoked these same
service methods, so the behaviour on the happy path is unchanged. What changes
is that a restart no longer loses the work.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.schemas.company import CompanyUpdateParams
from app.schemas.location import ResolveRoleLocationParams
from app.schemas.seniority import AlumniSeniorityParams

logger = logging.getLogger(__name__)


# Services are imported inside the functions rather than at module scope.
# Importing them here would pull the agents - and langchain, torch and the
# rest - into any process that merely wants to enqueue, including the web
# process, which never runs the work itself.


async def extract_linkedin_profile(ctx, alumni_id: str) -> None:
    from app.services.linkedin import linkedin_service

    await linkedin_service.extract_profile_data(alumni_id=alumni_id)


async def update_linkedin_profiles(ctx, alumni_ids: Optional[List[str]] = None) -> None:
    from app.services.linkedin import linkedin_service

    await linkedin_service.update_profile_data(alumni_ids=alumni_ids)


async def update_companies(ctx, company_ids: Optional[str] = None) -> None:
    from app.services.company import company_service

    await company_service.request_company_update(CompanyUpdateParams(company_ids=company_ids))


# classify_alumni_roles is gone: the CLASSIFY_ROLES stage now owns that path, so
# leaving the task registered would be one more entry point writing no run
# record. The service method it called is still used by the LinkedIn service.


async def classify_alumni_seniority(ctx, alumni_ids: Optional[str] = None) -> None:
    from app.services.seniority import seniority_service

    await seniority_service.request_alumni_seniority(AlumniSeniorityParams(alumni_ids=alumni_ids))


async def resolve_role_locations(ctx, role_ids: Optional[str] = None) -> None:
    from app.services.location import location_service

    await location_service.request_role_location(ResolveRoleLocationParams(role_ids=role_ids))


async def resolve_alumni_role_locations(ctx, alumni_id: str) -> None:
    from app.services.location import location_service

    await location_service.resolve_role_location_for_alumni(alumni_id)


async def run_stage(ctx, run_id: str, stage: str) -> str:
    """Execute one stage of a run, then enqueue whatever follows it.

    One arq job per stage rather than per entity: the services already fan out
    internally under their own semaphores and the shared token rate limiter, and
    max_jobs = 1 exists to keep that the real concurrency control. Per-entity
    resumption comes from the task rows, not from the queue.
    """
    from app.db.models import PipelineRun
    from app.db.session import session_scope
    from app.pipeline.control import cancel_checker
    from app.pipeline.executor import execute_stage
    from app.pipeline.registry import spec_for
    from app.pipeline.runs import ensure_stages, stage_row
    from app.pipeline.sequence import next_stage
    from app.pipeline.stages import PipelineRunStatus, PipelineStageName, PipelineStageStatus
    from app.pipeline.state import StageOutcome
    from app.tasks.queue import task_queue

    stage_name = PipelineStageName(stage)

    with session_scope() as db:
        run = db.get(PipelineRun, run_id)
        if run is None:
            logger.error("Run %s no longer exists; nothing to execute", run_id)
            return StageOutcome.CANCELLED.value

        ensure_stages(db, run)
        row = stage_row(db, run, stage_name)
        spec = spec_for(stage_name)

        if spec is None:
            # An unconverted stage is skipped rather than treated as failed, so
            # the chain still reaches the stages that are converted.
            row.status = PipelineStageStatus.SKIPPED
            db.commit()
            outcome = StageOutcome.COMPLETE
        else:
            run.status = PipelineRunStatus.RUNNING
            outcome = await execute_stage(db, run, row, spec, is_cancelled=cancel_checker(run.id))

        following = next_stage(stage_name)
        if outcome is not StageOutcome.COMPLETE:
            logger.info("Run %s stopped at %s: %s", run_id, stage, outcome.value)
            return outcome.value

        if following is None:
            run.status = PipelineRunStatus.COMPLETED
            run.finished_at = datetime.now(timezone.utc).replace(tzinfo=None)
            db.commit()
            logger.info("Run %s completed", run_id)
            return outcome.value

        db.commit()

    # Enqueued outside the session: the next stage is minutes of work and has no
    # business inheriting this one's connection.
    await task_queue.enqueue("run_stage", run_id=run_id, stage=following.value)
    return outcome.value


# Registered with the worker. Kept as an explicit list so that adding a task
# without registering it is a visible omission rather than a silent one.
TASKS = [
    run_stage,
    extract_linkedin_profile,
    update_linkedin_profiles,
    update_companies,
    classify_alumni_seniority,
    resolve_role_locations,
    resolve_alumni_role_locations,
]

TASK_NAMES = frozenset(task.__name__ for task in TASKS)
