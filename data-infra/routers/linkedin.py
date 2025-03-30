# Standard Library
import os, requests, time
from typing import List
from enum import Enum
from dotenv import load_dotenv

# Current Project Dependencies
from api_schemas.dto.linkedin import StartLinkedInExtractionParams
from .autorouter import make_router

load_dotenv()


class LinkedInScraper:
    token = os.getenv("BRIGHTDATA_API_KEY")
    base_url = os.getenv("BRIGHTDATA_BASE_URL")

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    def __init__(self):
        pass

    def scrape(self, linkedin_urls: List[str]) -> str:
        """
        Triggers a LinkedIn extraction for a list of LinkedIn URLs.

        Args:
            linkedin_urls (List[str]): A list of LinkedIn URLs to extract.

        Returns:
            str: The ID of the snapshot that was created.
        """

        url = f"{self.base_url}/trigger"

        params = {
            "dataset_id": "gd_l1viktl72bvl7bjuj0",
            "include_errors": "true",
        }

        data = [{"url": ldn_url} for ldn_url in linkedin_urls]

        response = requests.post(url, headers=self.headers, json=data, params=params)

        return response.json()["snapshot_id"]

    def get_snapshot_status(self, snapshot_id: str) -> str:
        """
        Get the status of a LinkedIn extraction.

        Args:
            snapshot_id (str): The ID of the snapshot to check.


        """
        url = f"{self.base_url}/progress/{snapshot_id}"
        response = requests.get(url, headers=self.headers)

        return response.json()["status"]

    def get_snapshot_data(self, snapshot_id: str) -> str:
        """
        Gets the data from a LinkedIn extraction.

        Args:
            snapshot_id (str): The ID of the snapshot to get data from.
        """
        url = f"{self.base_url}/snapshot/{snapshot_id}"
        response = requests.get(url, headers=self.headers)

        return response.json()


linkedin_scraper = LinkedInScraper()

router = make_router(
    prefix="/linkedin",
    tags=["linkedin"],
    dependencies=[],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/start-extraction",
    description="Starts a LinkedIn extraction.",
    response_model=str,
)
async def start_linkedin_extraction(params: StartLinkedInExtractionParams):
    return linkedin_scraper.scrape(params.linkedin_urls)


@router.get(
    "/check-progress",
    description="Checks the progress of a LinkedIn extraction.",
    response_model=str,
)
async def check_linkedin_extraction_progress(snapshot_id: str):
    return linkedin_scraper.get_snapshot_status(snapshot_id)


@router.get("/get-data", description="Gets the data from a LinkedIn extraction.")
async def get_linkedin_extraction_data(snapshot_id: str):
    return linkedin_scraper.get_snapshot_data(snapshot_id)


@router.post(
    "/start-and-wait",
    description="Starts a LinkedIn extraction and waits for it to complete. Returns the data when the extraction is ready.",
)
async def start_linkedin_extraction_and_wait(params: StartLinkedInExtractionParams):
    snapshot_id = linkedin_scraper.scrape(params.linkedin_urls)
    while linkedin_scraper.get_snapshot_status(snapshot_id) != "ready":
        time.sleep(5)
    return linkedin_scraper.get_snapshot_data(snapshot_id)
