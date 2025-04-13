
import logging
from time import sleep
from typing import Optional

from app.core.config import settings
from app.db import get_db
from app.db.models import Company
from app.schemas.company import CompanyUpdateParams
from app.schemas.linkedin import LinkedInCompanyResponse, convert_to_linkedin_company_response
from app.utils.company_db import get_all_companies, get_companies_by_ids, update_company
from app.utils.consts import BASE_WAIT_TIME, DEFAULT_INDUSTRY_ID
from app.utils.http_client import HTTPClient
from app.utils.industry_db import get_industry_by_name
from app.utils.misc.convert import convert_company_size_to_enum
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
        
        companies: list[Company] = []
        
        if company_ids:
            company_ids = company_ids.split(",")
            companies = get_companies_by_ids(company_ids, db)
        else:
            companies = get_all_companies(db)
            
        # just making sure the user was not dumb and provided duplicate company IDs
        # and newsflash, that user is me :))
        companies = set(companies)
        
        logger.info(f"Going to update {len(companies)} companies")
        for company in companies:
            await self.extract_company_data(company.linkedin_url, company.id)

    
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


company_service = CompanyService()
