import asyncio
import logging

from app.agents.location import location_agent
from app.db.models import Role, RoleRaw, SeniorityLevel
from app.db.session import get_db
from app.schemas.linkedin import ExperienceBase
from app.schemas.location import LocationType, RoleLocationInput
from app.schemas.role import RoleResolveLocationParams
from app.utils.misc.convert import linkedin_date_to_timestamp
from app.utils.role_db import get_all_roles, get_role_raw_by_id, get_roles_by_ids, update_role

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

REMOTE_LOCATION_ID = "15045675-0782-458b-9bb7-02567ac246fd"


class RoleService:
    async def resolve_role_location(self, params: RoleResolveLocationParams) -> None:
        """
        Resolves the location of the roles
        """
        role_ids = params.role_ids
        logger.info(f"Requesting role location resolution for {role_ids}")

        roles: list[Role] = []

        if role_ids:
            role_ids = role_ids.split(",")
            roles = get_roles_by_ids(role_ids, db)
        else:
            roles = get_all_roles(db)

        # just making sure the user was not dumb and provided duplicate role IDs
        # and newsflash, that user is me :))
        roles = list(set(roles))

        logger.info(f"Going to update {len(roles)} roles")

        batch_size = 30
        for i in range(0, len(roles), batch_size):
            batch = roles[i : i + batch_size]
            logger.info(
                f"Processing batch {i // batch_size + 1} of {(len(roles) + batch_size - 1) // batch_size} ({len(batch)} roles)"
            )

            tasks = []
            for role in batch:
                # Get the roleRaw for this role
                role_raw = get_role_raw_by_id(role.id, db)
                location = role_raw.location

                if not location:
                    # Not much we can so, set to remote
                    role.location_id = REMOTE_LOCATION_ID
                    update_role(role, db)
                    continue

                input = RoleLocationInput(
                    type=LocationType.ROLE,
                    role_id=role.id,
                    location=role_raw.location,
                )

                task = asyncio.create_task(location_agent.process_location(input))
                tasks.append(task)

            await asyncio.gather(*tasks)

            if i + batch_size < len(roles):
                await asyncio.sleep(0.5)

    async def parse_role(
        self,
        role: ExperienceBase,
        alumni_id: str,
        company_id: str,
    ) -> Role | None:
        """
        Parse a LinkedIn experience into a database Role object.

        Args:
            role: LinkedIn experience data
            alumni_id: ID of the alumni
            company_id: ID of the company

        Returns:
            Role object ready to be inserted in the database
        """
        logger.info(f"Parsing role {role.title} of {alumni_id}")

        # Convert LinkedIn date format to timestamps
        start_date = linkedin_date_to_timestamp(role.starts_at)

        # Start date is required in our schema, let's leave early (story of my life tbf)
        if not start_date:
            logger.warning(f"Invalid start date for role {role.title} of {alumni_id}")
            return None

        end_date = None if not role.ends_at else linkedin_date_to_timestamp(role.ends_at)

        # Create the Role object
        return Role(
            alumni_id=alumni_id,
            company_id=company_id,
            start_date=start_date,
            # Note: We'll have to leverage an agent to get the location from the role
            # As this is a free-text field, it's not always reliable like the general location
            # for the alumni
            location_id=None,
            end_date=end_date,
            seniority_level=SeniorityLevel.ASSOCIATE,
            is_current=end_date is None,
            is_promotion=False,
        )

    async def parse_raw_role(
        self,
        role_id: str,
        role_data: ExperienceBase,
    ) -> RoleRaw | None:
        """
        Takes a role_id and a role_data and returns a RoleRaw object.
        This is used to classify the role into a JobClassification later down the pipeline.
        """
        return RoleRaw(
            role_id=role_id,
            title=role_data.title,
            description=role_data.description,
            location=role_data.location,
        )


role_service = RoleService()
