import asyncio
import logging
from time import sleep

from app.agents.location import location_agent
from app.core.config import settings
from app.db import get_db
from app.db.models import Company
from app.schemas.company import CompanyUpdateParams
from app.schemas.linkedin import LinkedInCompanyResponse, convert_to_linkedin_company_response
from app.schemas.location import CompanyLocationInput, LocationType
from app.services.image_storage import image_storage_service
from app.utils.company_db import (
    get_all_companies,
    get_companies_by_ids,
    update_company,
)
from app.utils.consts import BASE_WAIT_TIME, DEFAULT_INDUSTRY_ID, NULL_ISLAND_ID
from app.utils.http_client import HTTPClient
from app.utils.industry_db import get_industry_by_name
from app.utils.misc.convert import convert_company_size_to_enum, convert_company_type_to_enum
from app.utils.misc.string import clean_website_url

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class CompanyService:
    def __init__(self):
        """Initialize the LinkedIn service with an HTTP client."""
        self.client = HTTPClient(
            timeout=60,
            headers={
                "Authorization": f"Bearer {settings.BRIGHTDATA_API_KEY}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            base_url=settings.BRIGHTDATA_BASE_URL,
        )

    async def request_company_update(self, params: CompanyUpdateParams):
        """
        Request a company update from BrightData.

        If company_ids is provided, it will only update the companies with the given IDs.
        If not, it will update all companies.
        """
        company_ids = params.company_ids
        logger.info(f"Requesting company update for {company_ids}")

        companies: list[Company] = []

        if company_ids:
            company_ids = company_ids.split(",")
            companies = get_companies_by_ids(company_ids, db)
        else:
            companies = get_all_companies(db)

        # just making sure the user was not dumb and provided duplicate company IDs
        # and newsflash, that user is me :))
        companies = list(set(companies))

        logger.info(f"Going to update {len(companies)} companies")
        
        # Process in batches of 10 to avoid overwhelming the system
        batch_size = 10
        for i in range(0, len(companies), batch_size):
            batch = companies[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1} of {(len(companies) + batch_size - 1)//batch_size} ({len(batch)} companies)")
            
            # Create and track tasks for this batch
            tasks = []
            for company in batch:
                task = asyncio.create_task(self.extract_company_data(company.linkedin_url, company.id))
                tasks.append(task)
            
            # Wait for all tasks in this batch to complete
            await asyncio.gather(*tasks)
            
            # Small delay between batches to prevent rate limiting
            if i + batch_size < len(companies):
                await asyncio.sleep(1)
                
            # test
            break

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
        base_wait_time = BASE_WAIT_TIME

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

        # *** Logo ***
        company_logo = None
        if company_response.logo:
            # Let's upload it to file storage
            company_logo = image_storage_service.upload_image(company_response.logo, company_id)

        # Create a task for location processing to be executed after company update
        if company_response.headquarters and company_response.country_code:
            input = CompanyLocationInput(
                type=LocationType.COMPANY,
                company_id=company_id,
                headquarters=company_response.headquarters,
                country_codes=company_response.country_code,
            )

        industry_id = DEFAULT_INDUSTRY_ID
        if company_response.industries:
            industry = get_industry_by_name(company_response.industries, db)
            if industry:
                industry_id = industry.id

        company = Company(
            id=company_id,
            name=company_response.name,
            linkedin_url=company_linkedin_url,
            industry_id=industry_id,
            logo=company_logo,
            # We'll be updating this later, in the Agent
            hq_location_id=NULL_ISLAND_ID,
            founded=company_response.founded,
            website=clean_website_url(company_response.website),
            company_size=convert_company_size_to_enum(company_response.company_size),
            company_type=convert_company_type_to_enum(company_response.organization_type),
        )

        try:
            # Update the company
            logger.info(f"Updating company {company_id}")
            update_company(company, db)
            
            # Now that the company is updated, trigger location processing
            if company_response.headquarters and company_response.country_code:
                # Execute location agent after company is saved to database
                await location_agent.parse_location(input)
        except Exception as e:
            logger.error(f"Error updating company {company_id}: {str(e)}")
            raise


company_service = CompanyService()
