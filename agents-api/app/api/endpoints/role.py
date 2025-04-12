from fastapi import APIRouter, status

from app.services.role import role_service

router = APIRouter()


@router.post(
    "/assign-random-location-to-roles",
    status_code=status.HTTP_200_OK,
    description="This endpoint assign a random location from the Location table to all roles that \
    don't have one - To be used only temporarily, until we can assign a proper location to each \
    role, using the agent",
)
async def assign_random_location_to_roles():
    role_service.assign_random_location_to_roles()
