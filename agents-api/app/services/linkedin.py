import asyncio
import logging
from datetime import datetime
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
    find_by_ids,
    update_alumni,
)
from app.utils.company_db import get_company_by_linkedin_url, insert_company
from app.utils.consts import REMOTE_LOCATION_ID
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
            base_url=settings.ALUMNI_EXTRACT_BASE_URL,
        )
        self._background_tasks = set()

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def close(self):
        """Close the HTTP client and wait for background tasks."""
        # Wait for all background tasks to complete
        if self._background_tasks:
            await asyncio.gather(*self._background_tasks, return_exceptions=True)
        # Close the HTTP client
        await self.client.aclose()

    def _create_background_task(self, coro):
        """Create and track a background task."""
        task = asyncio.create_task(coro)
        self._background_tasks.add(task)
        task.add_done_callback(self._background_tasks.discard)
        return task

    def __del__(self):
        """Ensure sync client is closed when object is destroyed."""
        self.client.close()

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
                    "Authorization": f"Bearer {settings.ALUMNI_EXTRACT_API_KEY}",
                }
            )

            params = {
                "linkedin_profile_url": profile_url,
                "use_cache": "if-recent",
                "fallback_to_cache": "on-error",
            }

            raw_response = self.client.get_json("/profile", params=params)

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
                    self._create_background_task(
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
        location_id = REMOTE_LOCATION_ID
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
                self._create_background_task(location_agent.process_location(input))

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
        self._create_background_task(
            job_classification_service.request_alumni_classification(
                params=AlumniJobClassificationParams(alumni_ids=alumni_id)
            )
        )

        # We'll also use the location agent to update the alumni location
        self._create_background_task(location_service.resolve_role_location_for_alumni(alumni_id))

    async def update_profile_data(
        self,
        alumni_ids: Optional[List[str]] = None,
        batch_size: int = 20,
    ):
        """
        Update the profile data for specified alumni or all alumni if none specified.
        Processes updates in parallel batches for better performance.

        Args:
            alumni_ids: Optional list of alumni IDs to update. If None, updates all alumni.
            batch_size: Number of profiles to process concurrently. Defaults to 5.
        """
        try:
            # Get alumni from database based on whether specific IDs were provided
            ids = alumni_ids if alumni_ids else [alumni.id for alumni in find_all(db)]

            results = []
            for i in range(0, len(ids), batch_size):
                batch = ids[i : i + batch_size]
                logger.info(f"Processing batch of {len(batch)} alumni")

                tasks = []
                for alumni_id in batch:
                    task = self._create_background_task(self.process_single_alumni(alumni_id))
                    tasks.append(task)

                # Wait for all tasks in this batch to complete
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                results.extend([isinstance(r, bool) and r for r in batch_results])

                # Small delay between batches
                if i + batch_size < len(ids):
                    await asyncio.sleep(1)

        finally:
            # Ensure we wait for any remaining background tasks
            if self._background_tasks:
                await asyncio.gather(*self._background_tasks, return_exceptions=True)

    async def process_single_alumni(self, alumni_id: str):
        """Process a single alumni profile."""
        try:
            # Delete existing data before extraction
            delete_profile_data(alumni_id, db)

            # Extract new data
            await self.extract_profile_data(alumni_id)
            return True
        except Exception as e:
            logger.error(f"Error processing alumni {alumni_id}: {str(e)}")
            alumni = find_by_id(alumni_id, db)
            existing_metadata = alumni.metadata_ or {}

            error_info = {
                "linkedin_error": {
                    "message": str(e),
                    "timestamp": datetime.now().isoformat(),
                    "type": e.__class__.__name__,
                }
            }
            updated_metadata = {**existing_metadata, **error_info}

            update_alumni(Alumni(id=alumni_id, metadata_=updated_metadata), db)
            return False


linkedin_service = LinkedInService()
