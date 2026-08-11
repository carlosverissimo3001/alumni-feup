import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.location import (
    ResolveAlumniLocationParams,
    ResolveRoleLocationParams,
)
from app.tasks.queue import task_queue
from app.utils.alumni_db import find_all

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/role",
    status_code=status.HTTP_201_CREATED,
)
async def resolve_role_location(params: ResolveRoleLocationParams = Depends()):
    """
    Triggers the agent to resolve the location of a role.

    If none are provided, it will update all roles.
    """
    try:
        logger.info(f"Resolving location for roles {params.role_ids}")

        await task_queue.enqueue("resolve_role_locations", role_ids=params.role_ids)

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
    params: ResolveAlumniLocationParams = Depends(),
    db: Session = Depends(get_db),
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
            await task_queue.enqueue("resolve_alumni_role_locations", alumni_id=alumni_id)
    except Exception as e:
        logger.error(f"Error resolving location for alumni {params.alumni_ids}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resolving location for alumni",
        )
