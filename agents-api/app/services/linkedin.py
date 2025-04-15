import asyncio
import logging
from time import sleep

from app.core.config import settings
from app.db import get_db
from app.db.models import Alumni, Company, Location, Role, RoleRaw
from app.schemas.linkedin import (
    ExperienceBase,
    LinkedInCompanyResponse,
    LinkedInProfileResponse,
    convert_to_linkedin_company_response,
    convert_to_linkedin_profile_response,
)
from app.utils.alumni_db import update_alumni
from app.utils.company_db import get_company_by_linkedin_url, insert_company, update_company
from app.utils.consts import DEFAULT_INDUSTRY_ID, NULL_ISLAND_ID
from app.utils.http_client import HTTPClient
from app.utils.industry_db import get_industry_by_name
from app.utils.location_db import create_location, get_location
from app.utils.misc.convert import convert_company_size_to_enum, linkedin_date_to_timestamp
from app.utils.misc.string import clean_website_url, sanitize_linkedin_url
from app.utils.role_db import create_role, create_role_raw
from app.services.job_classification import job_classification_service

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
        profile_url: str,
        alumni_id: str,
    ):
        """
        Extract data from a LinkedIn profile URL.

        Args:
            profile_url: URL of the LinkedIn profile
            alumni_id: ID of the alumni for linking data

        """
        logger.info(f"Extracting LinkedIn data for {profile_url}")

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

    async def extract_company_data(
        self,
        company_url: str,
        company_id: str,
    ):
        """
        Extract data from a LinkedIn company URL.

        Args:
            company_url: URL of the LinkedIn company
            company_id: ID of the company in our database
        """
        logger.info(f"Extracting company data for {company_url} with BrightData")

        # Note: The company extraction is done via Bright Data as its cheaper than Proxycurl
        # It's not instant, but its a trade-off we are willing to make
        self.client.set_base_url(settings.BRIGHTDATA_BASE_URL)

        self.client.set_headers(
            {
                "Authorization": f"Bearer {settings.BRIGHTDATA_API_KEY}",
                "Content-Type": "application/json",
            }
        )

        params = {
            "dataset_id": settings.BRIGHTDATA_COMPANY_DATASET_ID,
            "include_errors": "true",
        }

        trigger_response = self.client.post_json(
            "/trigger",
            params=params,
            json=[{"url": company_url}],
        )

        # We get the snapshot_id from the response
        snapshot_id = trigger_response.get("snapshot_id")

        # In production, we'll have webhooks, so we can just return the snapshot_id
        # and continue with our lives
        if settings.ENVIRONMENT != "development":
            return snapshot_id

        # In development, we have to wait for the snapshot to be ready
        # Use exponential backoff to reduce unnecessary API calls
        retry_count = 0
        max_retries = 10
        base_wait_time = 1  # Start with 1 second

        while retry_count < max_retries:
            wait_time = base_wait_time * (2**retry_count)
            wait_time = min(wait_time, 60)

            snapshot_response = self.client.get_json(
                f"/progress/{snapshot_id}",
            )

            if snapshot_response.get("status") == "ready":
                logger.info(f"Snapshot ready after {retry_count} retries")
                break

            logger.info(
                f"Snapshot not ready yet, waiting {wait_time}s before retry {retry_count + 1}/{max_retries}"  # noqa: E501
            )
            sleep(wait_time)
            retry_count += 1

        if retry_count >= max_retries:
            logger.warning(
                f"Reached maximum retries ({max_retries}) waiting for snapshot {snapshot_id}"
            )

        company_raw = self.client.get_json(
            f"/snapshot/{snapshot_id}",
        )

        # If the company is not found, we return None
        # We can do this, by checking if it has a name
        if not company_raw.get("name"):
            return None

        company_response = convert_to_linkedin_company_response(company_raw)

        await self.process_company_data(company_response, company_id, company_url)

    async def process_profile_data(
        self,
        profile_data: LinkedInProfileResponse,
        alumni_id: str,
    ) -> None:
        logger.info(f"Processing profile data for alumni with id {alumni_id}")

        # First, let's parse the roles, to understand if we need to extract company data
        for role in profile_data.experiences:
            if role.company_linkedin_profile_url:
                sanitized_url = sanitize_linkedin_url(role.company_linkedin_profile_url)
                company_id: str = ""

                db_company = get_company_by_linkedin_url(sanitized_url, db)
                # All good, no need to call the API
                if db_company:
                    logger.info(f"Company {sanitized_url} found in the database")
                    company_id = db_company.id
                else:
                    logger.info(f"Company {sanitized_url} not found in the database")
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
                    asyncio.create_task(self.extract_company_data(sanitized_url, company_id))

                # Now we can parse the role
                role_db = await self.parse_role(role, alumni_id, company_id)

                # If the role is not valid, we skip it
                if not role_db:
                    continue

                # And insert it into the database
                create_role(role_db, db)

                # And insert the raw role
                raw_role = await self.parse_raw_role(role_db.id, role)
                create_role_raw(raw_role, db)

        # Now, let's try to find their location
        city = profile_data.city
        country = profile_data.country_full_name
        country_code = profile_data.country

        # All are fields null? Let's put this person in the middle of the oceandels
        location_id = NULL_ISLAND_ID
        if city or country or country_code:
            location = get_location(city, country, country_code, db)
            
            logger.info(f"Location: {location}")

            # TODO: We might need to leverage an agent, instead of just assuming the location was not found
            # I.e, in the DB, we might have Seattle, United States
            # But this user location is Seattle, United States of America
            # This is obviously a trivial case, but it might be a problem for more complex ones
            
            if not location:
                location = create_location(
                    Location(city=city, country=country, country_code=country_code), db
                )
            
            location_id = location.id

        # Update the alumni table (Alumni was already created by our backend)
        update_alumni(
            Alumni(
                id=alumni_id,
                profile_picture_url=profile_data.profile_pic_url,
                current_location_id=location_id,
            ),
            db,
        )
        
        # We'll now offload the role classification to a background task, using the agent
        # Note that we do NOT wait for this to finish, as it can take a while
        asyncio.create_task(job_classification_service.classify_roles_for_alumni(alumni_id))

    async def process_company_data(
        self,
        company_response: LinkedInCompanyResponse,
        company_id: str,
        company_linkedin_url: str,
    ) -> None:
        """
        Process company data from LinkedIn and update our database.

        Args:
            company_response: LinkedIn company data from the API
            company_id: ID of the company in our database
        """
        logger.info(f"Processing company data for {company_linkedin_url}")

        industry = get_industry_by_name(company_response.industries, db)
        industry_id = industry.id if industry else DEFAULT_INDUSTRY_ID

        company = Company(
            id=company_id,
            name=company_response.name,
            linkedin_url=company_linkedin_url,
            industry_id=industry_id,
            logo=company_response.logo,
            founded=company_response.founded,
            website=clean_website_url(company_response.website),
            company_size=convert_company_size_to_enum(company_response.company_size),
        )

        try:
            # Update the company
            update_company(company, db)
        except Exception as e:
            logger.error(f"Error updating company {company_id}: {str(e)}")
            raise

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
            location=role.location,
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


linkedin_service = LinkedInService()
