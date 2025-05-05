import logging
import random

from app.db.session import get_db
from app.utils.location_db import get_all_locations
from app.utils.role_db import get_all_roles, update_role
from app.schemas.linkedin import ExperienceBase
from app.db.models import Role, RoleRaw, SeniorityLevel
from app.utils.misc.convert import linkedin_date_to_timestamp

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

class RoleService:
    def assign_random_location_to_roles(self) -> None:
        no_location_roles = get_all_roles(db)
        all_locations = get_all_locations(db)
        
        for role in no_location_roles:
            location = random.choice(all_locations)
            role.location_id = location.id
            update_role(role, db)
            
    
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
        )

role_service = RoleService()
