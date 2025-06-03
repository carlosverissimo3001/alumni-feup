import asyncio
import logging
from typing import List, Optional

from app.agents.location import location_agent
from app.core.config import settings
from app.db import get_db
from app.db.models import Alumni, Company
from app.schemas.job_classification import AlumniJobClassificationParams
from app.schemas.linkedin import (
    LinkedInProfileResponse,
    convert_to_linkedin_profile_response,
)
from app.schemas.location import AlumniLocationInput, LocationType
from app.services.company import company_service
from app.services.image_storage import image_storage_service
from app.services.job_classification import job_classification_service
from app.services.location import location_service
from app.services.role import role_service
from app.utils.alumni_db import (
    delete_profile_data,
    find_all,
    find_by_id,
    update_alumni,
)
from app.utils.company_db import get_company_by_linkedin_url, insert_company
from app.utils.consts import NULL_ISLAND_ID
from app.utils.http_client import HTTPClient
from app.utils.location_db import get_location
from app.utils.misc.string import sanitize_linkedin_url
from app.utils.role_db import create_role, create_role_raw

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class LinkedInService:
    """Service for interacting with LinkedIn and processing profile data."""

    def __init__(self):
        """Initialize the LinkedIn service with an HTTP client."""
        self.client = HTTPClient(
            timeout=60,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            base_url=settings.PROXYCURL_BASE_URL,
        )

    async def extract_profile_data(
        self,
        alumni_id: str,
    ):
        """
        Extract data from a LinkedIn profile URL.

        Args:
            profile_url: URL of the LinkedIn profile
            alumni_id: ID of the alumni for linking data

        """
        # logger.info(f"Extracting LinkedIn data for {alumni_id}")

        # Get the alumni from the database
        alumni = find_by_id(alumni_id, db)
        if not alumni or not alumni.linkedin_url:
            # logger.error(f"Alumni with id {alumni_id} not found or has no LinkedIn URL")
            return

        profile_url = alumni.linkedin_url

        try:
            self.client.set_headers(
                {
                    "Authorization": f"Bearer {settings.PROXYCURL_API_KEY}",
                }
            )

            params = {
                "linkedin_profile_url": profile_url,
                "use_cache": "if-present",
                "fallback_to_cache": "on-error",
            }

            raw_response = self.client.get_json("/v2/linkedin", params=params)

            response = convert_to_linkedin_profile_response(raw_response)
            await self.process_profile_data(response, alumni_id)

        except Exception as e:
            logger.error(f"Error extracting LinkedIn data: {str(e)}")
            raise

    async def process_profile_data(
        self,
        profile_data: LinkedInProfileResponse,
        alumni_id: str,
    ) -> None:
        # First, let's parse the roles, to understand if we need to extract company data
        for role in profile_data.experiences:
            if role.company_linkedin_profile_url:
                sanitized_url = sanitize_linkedin_url(role.company_linkedin_profile_url)
                company_id: str = ""

                db_company = get_company_by_linkedin_url(sanitized_url, db)
                # All good, no need to call the API
                if db_company:
                    company_id = db_company.id
                else:
                    # We insert the company before we call the API, so that we can link the role to the company # noqa: E501
                    db_company = insert_company(
                        Company(
                            linkedin_url=sanitized_url,
                            # will be updated later
                            name=role.company,
                            # industry_id is set to the default industry id, will be updated later
                        ),
                        db,
                    )
                    company_id = db_company.id

                    # Let's offload the company extraction to a background task
                    asyncio.create_task(
                        company_service.extract_company_data(sanitized_url, company_id)
                    )

                # Now we can parse the role
                role_db = await role_service.parse_role(role, alumni_id, company_id)

                # If the role is not valid, we skip it
                if not role_db:
                    continue

                # And insert it into the database
                create_role(role_db, db)

                # And insert the raw role
                raw_role = await role_service.parse_raw_role(role_db.id, role)
                create_role_raw(raw_role, db)

        # Now, let's try to find their location
        city = profile_data.city
        country = profile_data.country_full_name
        country_code = profile_data.country

        # All are fields null? Let's put this person in the middle of the oceandels
        location_id = NULL_ISLAND_ID
        if city or country or country_code:
            location = get_location(city, country, country_code, db)

            # Could not find a location in the database, let's use the agent to resolve it
            if not location:
                input = AlumniLocationInput(
                    type=LocationType.ALUMNI,
                    alumni_id=alumni_id,
                    city=city,
                    country=country,
                    country_code=country_code,
                )
                asyncio.create_task(location_agent.process_location(input))

            else:
                location_id = location.id
        # Let's upload their picture to cloudinary
        profile_picture_url = None
        if profile_data.profile_pic_url:
            profile_picture_url = image_storage_service.upload_image(
                profile_data.profile_pic_url, alumni_id
            )

        # Update the alumni table (Alumni was already created by our backend :))) )
        update_alumni(
            Alumni(
                id=alumni_id,
                profile_picture_url=profile_picture_url,
                current_location_id=location_id,
            ),
            db,
        )

        # We'll now offload the role classification to a background task, using the agent
        # Note that we do NOT wait for this to finish, as it can take a while
        asyncio.create_task(
            job_classification_service.request_alumni_classification(
                params=AlumniJobClassificationParams(alumni_ids=alumni_id)
            )
        )

        # We'll also use the location agent to update the alumni location
        asyncio.create_task(location_service.resolve_role_location_for_alumni(alumni_id))

    async def update_profile_data(
        self,
        alumni_ids: Optional[List[str]] = None,
    ):
        """
        Update the profile data for specified alumni or all alumni if none specified.

        Args:
            alumni_ids: Optional list of alumni IDs to update. If None, updates all alumni.
        """
        # Get alumni from database based on whether specific IDs were provided
        ids = alumni_ids if alumni_ids else [alumni.id for alumni in find_all(db)]

        for alumni_id in ids:
            # Delete existing data before extraction
            logger.info(f"Deleting existing data for {alumni_id}")
            delete_profile_data(alumni_id, db)

            # Extract new data
            logger.info(f"Extracting LinkedIn data for {alumni_id}")
            await self.extract_profile_data(alumni_id)


linkedin_service = LinkedInService()
