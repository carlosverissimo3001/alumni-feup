import asyncio
import logging

from app.agents.location import location_agent
from app.db.models import Location, Role
from app.db.session import session_scope
from app.schemas.location import (
    LocationType,
    ResolveRoleLocationParams,
    RoleLocationInput,
)
from app.services.coordinates import coordinates_service
from app.utils.pipeline_timeout import with_pipeline_timeout
from app.utils.role_db import (
    get_all_roles,
    get_role_raw_by_id,
    get_roles_by_alumni_id,
    get_roles_by_ids,
)

logger = logging.getLogger(__name__)

# Get a database session for the service


class LocationService:
    async def request_role_location(self, params: ResolveRoleLocationParams):
        """
        Resolves the location of the roles
        """
        role_ids = params.role_ids

        # Everything the database is needed for happens here. The batches below
        # sleep 60s between them, so holding the session open across the whole
        # run would pin a connection for the duration.
        with session_scope() as db:
            roles: list[Role] = (
                get_roles_by_ids(role_ids.split(","), db) if role_ids else get_all_roles(db)
            )

            # just making sure the user was not dumb and provided duplicate role IDs
            # and newsflash, that user is me :))
            roles = list(set(roles))

            inputs: list[RoleLocationInput] = []
            for role in roles:
                role_raw = get_role_raw_by_id(role.id, db)
                # A role with no raw row, or no free-text location on it, is not
                # something the agent can resolve. Previously the former raised
                # AttributeError and took the whole batch down.
                if not role_raw or not role_raw.location:
                    continue
                inputs.append(
                    RoleLocationInput(
                        type=LocationType.ROLE,
                        role_id=role.id,
                        location=role_raw.location,
                    )
                )

        batch_size = 300
        for i in range(0, len(inputs), batch_size):
            logger.info(f"Processing batch {i // batch_size + 1} of {len(inputs) // batch_size}")

            batch = inputs[i : i + batch_size]

            tasks = [
                asyncio.create_task(
                    with_pipeline_timeout(
                        location_agent.process_location(loc_input),
                        step="location.process_location",
                    )
                )
                for loc_input in batch
            ]

            await asyncio.gather(*tasks)

            if i + batch_size < len(inputs):
                await asyncio.sleep(60)

    async def resolve_role_location_for_alumni(self, alumni_id: str) -> None:
        """
        Resolves the location of the roles for a given alumni
        """
        with session_scope() as db:
            roles = get_roles_by_alumni_id(alumni_id, db)
            role_ids_str = ",".join(role.id for role in roles)

        await self.request_role_location(ResolveRoleLocationParams(role_ids=role_ids_str))

    async def update_location_coordinates(self, location: Location):
        """
        Get the coordinates of a city from the Geocoding API and update the location object
        """
        await coordinates_service.update_location_coordinates(location.id)


location_service = LocationService()
