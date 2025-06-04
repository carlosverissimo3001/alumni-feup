import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.db.session import get_db
from app.schemas.location import (
    ResolveAlumniLocationParams,
    ResolveCompanyLocationParams,
    ResolveRoleLocationParams,
)
from app.services.location import location_service
from app.utils.alumni_db import find_all

router = APIRouter()
logger = logging.getLogger(__name__)

db = next(get_db())


@router.post(
    "/role",
    status_code=status.HTTP_201_CREATED,
)
async def resolve_role_location(
    background_tasks: BackgroundTasks, params: ResolveRoleLocationParams = Depends()
):
    """
    Triggers the agent to resolve the location of a role.

    If none are provided, it will update all roles.
    """
    try:
        logger.info(f"Resolving location for roles {params.role_ids}")

        background_tasks.add_task(
            location_service.request_role_location,
            params=params,
        )

    except Exception as e:
        logger.error(f"Error classifying job title: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error classifying job title",
        )


@router.post(
    "/alumni",
    status_code=status.HTTP_201_CREATED,
)
async def resolve_alumni_location(
    background_tasks: BackgroundTasks, params: ResolveAlumniLocationParams = Depends()
):
    """
    Triggers the agent to resolve the location of an alumni.

    If none are provided, it will update all alumni.
    """
    try:
        logger.info(f"Resolving location for alumni {params.alumni_ids}")
        alumni_ids = (
            params.alumni_ids.split(",") if params.alumni_ids else [id for id in find_all(db)]
        )

        for alumni_id in alumni_ids:
            background_tasks.add_task(
                location_service.resolve_role_location_for_alumni,
                alumni_id=alumni_id,
            )
    except Exception as e:
        logger.error(f"Error resolving location for alumni {params.alumni_ids}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resolving location for alumni",
        )


@router.post(
    "/company",
    status_code=status.HTTP_201_CREATED,
)
async def resolve_company_location(
    background_tasks: BackgroundTasks, params: ResolveCompanyLocationParams = Depends()
):
    """
    Triggers the agent to resolve the location of a company.

    If none are provided, it will update all companies.
    """
    try:
        logger.info(f"Resolving location for company {params.company_ids}")

        background_tasks.add_task(
            location_service.request_company_location,
            params=params,
        )
    except Exception as e:
        logger.error(f"Error resolving location for company {params.company_ids}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resolving location for company",
        )
