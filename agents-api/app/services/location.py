import asyncio
import logging

from app.agents.location import location_agent
from app.db import get_db
from app.db.models import Location, Role
from app.schemas.location import (
    LocationType,
    ResolveRoleLocationParams,
    RoleLocationInput,
)
from app.services.coordinates import coordinates_service
from app.utils.role_db import (
    get_all_roles,
    get_role_raw_by_id,
    get_roles_by_alumni_id,
    get_roles_by_ids,
)

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class LocationService:
    async def request_role_location(self, params: ResolveRoleLocationParams):
        """
        Resolves the location of the roles
        """
        role_ids = params.role_ids

        roles: list[Role] = []

        if role_ids:
            role_ids = role_ids.split(",")
            roles = get_roles_by_ids(role_ids, db)
        else:
            roles = get_all_roles(db)

        # just making sure the user was not dumb and provided duplicate role IDs
        # and newsflash, that user is me :))
        roles = list(set(roles))

        # logger.info(f"Going to update {len(roles)} roles")

        batch_size = 30
        for i in range(0, len(roles), batch_size):
            batch = roles[i : i + batch_size]

            tasks = []
            for role in batch:
                role_raw = get_role_raw_by_id(role.id, db)
                location = role_raw.location

                if not location:
                    continue

                loc_input = RoleLocationInput(
                    type=LocationType.ROLE,
                    role_id=role.id,
                    location=role_raw.location,
                )

                task = asyncio.create_task(location_agent.process_location(loc_input))
                tasks.append(task)

            await asyncio.gather(*tasks)

            if i + batch_size < len(roles):
                await asyncio.sleep(0.5)

    async def resolve_role_location_for_alumni(self, alumni_id: str) -> None:
        """
        Resolves the location of the roles for a given alumni
        """
        roles = get_roles_by_alumni_id(alumni_id, db)
        role_ids = [role.id for role in roles]
        role_ids_str = ",".join(role_ids)
        await self.request_role_location(ResolveRoleLocationParams(role_ids=role_ids_str))

    async def update_location_coordinates(self, location: Location):
        """
        Get the coordinates of a city from the Geocoding API and update the location object
        """
        await coordinates_service.update_location_coordinates(location)


location_service = LocationService()
