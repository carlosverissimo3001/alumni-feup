import asyncio
import logging
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.agents.location import location_agent
from app.core.config import settings
from app.db.models import Alumni
from app.db.session import session_scope
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
from app.services.role_reconciliation import (
    ReconciliationConflictError,
    ReconciliationOutcome,
    reconcile_alumni_roles,
)
from app.utils.alumni_db import (
    find_all,
    find_by_id,
    update_alumni,
)
from app.utils.consts import REMOTE_LOCATION_ID
from app.utils.http_client import HTTPClient
from app.utils.location_db import get_location
from app.utils.pipeline_timeout import with_pipeline_timeout

logger = logging.getLogger(__name__)

# Get a database session for the service


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
        skip_followup_classification: bool = False,
        skip_followup_location: bool = False,
        skip_followup_company_extraction: bool = False,
    ):
        """
        Extract data from a LinkedIn profile URL.

        Args:
            profile_url: URL of the LinkedIn profile
            alumni_id: ID of the alumni for linking data
            skip_followup_classification: True when the caller already runs
                classification explicitly right after (e.g. the pipeline's
                CLASSIFY_ROLES stage), so the background classification this
                method would otherwise fire is redundant. The standalone
                extraction path has no such follow-up and keeps the default.
            skip_followup_location: True when the caller already runs location
                resolution explicitly right after (e.g. the pipeline's LOCATION
                stage), so the background location call this method would
                otherwise fire is redundant. The standalone extraction path has
                no such follow-up and keeps the default.
            skip_followup_company_extraction: True when the caller already
                runs company enrichment explicitly right after (e.g. the
                pipeline's COMPANY stage), so the background BrightData
                extraction this method would otherwise fire for each
                newly-seen company is redundant, billed, work. The standalone
                extraction path has no such follow-up and keeps the default.

        """
        # logger.info(f"Extracting LinkedIn data for {alumni_id}")

        # Session held for the lookup only - the API call and processing below
        # take far longer than the query.
        with session_scope() as db:
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
            await self.process_profile_data(
                response,
                alumni_id,
                skip_followup_classification=skip_followup_classification,
                skip_followup_location=skip_followup_location,
                skip_followup_company_extraction=skip_followup_company_extraction,
            )

        except Exception as e:
            logger.error(f"Error extracting LinkedIn data: {str(e)}")
            raise

    async def process_profile_data(
        self,
        profile_data: LinkedInProfileResponse,
        alumni_id: str,
        skip_followup_classification: bool = False,
        skip_followup_location: bool = False,
        skip_followup_company_extraction: bool = False,
    ) -> None:
        # Uploading to Cloudinary needs no session, so it happens before one is
        # opened rather than holding a pool connection during the upload.
        profile_picture_url = None
        if profile_data.profile_pic_url:
            profile_picture_url = image_storage_service.upload_image(
                profile_data.profile_pic_url, alumni_id
            )

        # One session for the whole unit of work: the Company and Role rows are
        # created and written here, so they stay attached to the session that
        # persists them.
        with session_scope() as db:
            await self._persist_profile_data(
                profile_data,
                alumni_id,
                profile_picture_url,
                db,
                skip_followup_company_extraction=skip_followup_company_extraction,
            )

        # Offloaded after the session closes - these are fire-and-forget and
        # must not hold a connection.
        # Skipped when the caller already classifies this alumni explicitly
        # right after (e.g. the pipeline's CLASSIFY_ROLES stage) - firing this
        # too would just classify them twice (CAR-474).
        if not skip_followup_classification:
            self._create_background_task(
                job_classification_service.request_alumni_classification(
                    params=AlumniJobClassificationParams(alumni_ids=alumni_id)
                )
            )
        # Skipped when the caller already resolves this alumni's location
        # explicitly right after (e.g. the pipeline's LOCATION stage) - firing
        # this too would just resolve it twice.
        if not skip_followup_location:
            self._create_background_task(
                location_service.resolve_role_location_for_alumni(alumni_id)
            )

    async def _persist_profile_data(
        self,
        profile_data: LinkedInProfileResponse,
        alumni_id: str,
        profile_picture_url: Optional[str],
        db: Session,
        skip_followup_company_extraction: bool = False,
    ) -> ReconciliationOutcome:
        """Commits as one transaction per alumnus; nothing is applied on a
        reconciliation conflict."""
        outcome = reconcile_alumni_roles(
            db,
            alumni_id,
            profile_data.experiences,
            experiences_field_present=profile_data.experiences_field_present,
        )
        if not outcome.ok:
            raise ReconciliationConflictError(
                f"Could not reconcile LinkedIn data for alumnus {alumni_id}: {outcome.conflict}"
            )

        if not skip_followup_company_extraction:
            for company_id, company_url in outcome.new_companies.items():
                self._create_background_task(
                    company_service.extract_company_data(company_url, company_id)
                )

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
                self._create_background_task(
                    with_pipeline_timeout(
                        location_agent.process_location(input),
                        step="location.process_location",
                    )
                )

            else:
                location_id = location.id
        # Update the alumni table (Alumni was already created by our backend :))) )
        update_alumni(
            Alumni(
                id=alumni_id,
                profile_picture_url=profile_picture_url,
                current_location_id=location_id,
            ),
            db,
        )
        return outcome

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
            if alumni_ids:
                ids = alumni_ids
            else:
                with session_scope() as db:
                    ids = [alumni.id for alumni in find_all(db)]

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
        try:
            await self.extract_profile_data(alumni_id)
            return True
        except Exception as e:
            logger.error(f"Error processing alumni {alumni_id}: {str(e)}")
            with session_scope() as db:
                alumni = find_by_id(alumni_id, db)
                existing_metadata = alumni.metadata_ or {} if alumni else {}

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
