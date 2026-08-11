"""Task functions run by the arq worker.

Each is a thin wrapper over the service that already does the work. The
services keep their own semaphores, rate limiting and session scoping - this
layer only decides what runs, when, and how often it retries.

Deliberately thin: the previous BackgroundTasks call sites invoked these same
service methods, so the behaviour on the happy path is unchanged. What changes
is that a restart no longer loses the work.
"""

import logging
from typing import List, Optional

from app.schemas.company import CompanyUpdateParams
from app.schemas.job_classification import AlumniJobClassificationParams
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


async def classify_alumni_roles(ctx, alumni_ids: Optional[str] = None) -> None:
    from app.services.job_classification import job_classification_service

    await job_classification_service.request_alumni_classification(
        params=AlumniJobClassificationParams(alumni_ids=alumni_ids)
    )


async def classify_alumni_seniority(ctx, alumni_ids: Optional[str] = None) -> None:
    from app.services.seniority import seniority_service

    await seniority_service.request_alumni_seniority(AlumniSeniorityParams(alumni_ids=alumni_ids))


async def resolve_role_locations(ctx, role_ids: Optional[str] = None) -> None:
    from app.services.location import location_service

    await location_service.request_role_location(ResolveRoleLocationParams(role_ids=role_ids))


async def resolve_alumni_role_locations(ctx, alumni_id: str) -> None:
    from app.services.location import location_service

    await location_service.resolve_role_location_for_alumni(alumni_id)


# Registered with the worker. Kept as an explicit list so that adding a task
# without registering it is a visible omission rather than a silent one.
TASKS = [
    extract_linkedin_profile,
    update_linkedin_profiles,
    update_companies,
    classify_alumni_roles,
    classify_alumni_seniority,
    resolve_role_locations,
    resolve_alumni_role_locations,
]

TASK_NAMES = frozenset(task.__name__ for task in TASKS)
