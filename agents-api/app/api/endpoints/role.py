import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.role import RoleResolveLocationParams
from app.tasks.queue import task_queue

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/resolve-role-location",
    status_code=status.HTTP_200_OK,
    description="Resolve the location of the roles",
)
async def resolve_role_location(params: RoleResolveLocationParams):
    """
    Trigger the location agent to resolve the location of the roles

    If no roles are provided, it will update all roles.
    """
    try:
        logger.info(f"Requesting role location resolution for {params.role_ids}")

        await task_queue.enqueue(
            "resolve_role_locations",
            params=params,
        )

    except Exception as e:
        logger.error(f"Error requesting role location resolution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error requesting role location resolution",
        )
