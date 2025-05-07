import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.schemas.role import RoleResolveLocationParams
from app.services.role import role_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/resolve-role-location",
    status_code=status.HTTP_200_OK,
    description="Resolve the location of the roles",
)
async def resolve_role_location(
    background_tasks: BackgroundTasks, params: RoleResolveLocationParams
):
    """
    Trigger the location agent to resolve the location of the roles

    If no roles are provided, it will update all roles.
    """
    try:
        logger.info(f"Requesting role location resolution for {params.role_ids}")

        background_tasks.add_task(
            role_service.resolve_role_location,
            params=params,
        )

    except Exception as e:
        logger.error(f"Error requesting role location resolution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error requesting role location resolution",
        )
