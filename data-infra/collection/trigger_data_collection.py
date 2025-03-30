# https://docs.brightdata.com/api-reference/web-scraper-api/trigger-a-collection
'''
This script is responsible for triggering the data collection of LinkedIn profiles.
It is the entrypoint of both:
- Batch collection, where the whole alumni list in the database is scraped
- Single profile collection, where a single profile is scraped

The input of this script is a list of alumni linkedin profile URLs, in JSON format.

Example:
[ 
    { "url": "https://www.linkedin.com/in/john-doe" },
    { "url": "https://www.linkedin.com/in/jane-doe" }
]

Query Parameters:
- notify: This is a URL that will be notified once the scraping is compl

'''


import requests
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional

load_dotenv()

BRIGHTDATA_BASE_URL = os.getenv("BRIGHTDATA_BASE_URL")
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")

class BrightDataError(Exception):
    pass

def trigger_collection(profiles: List[Dict[str, str]]) -> Dict:
    """
    Trigger the collection of LinkedIn profiles
    Args:
        profiles: List of dictionaries containing profile URLs
        Example: [{"url": "https://www.linkedin.com/in/john-doe"}]
    Returns:
        Dict containing collection_id and other metadata from Brightdata
    """
    headers = {
        "Authorization": f"Bearer {BRIGHTDATA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "urls": [profile["url"] for profile in profiles],
        "callback_url": None,  # We'll poll for results instead of using callbacks initially
    }
    
    response = requests.post(
        f"{BRIGHTDATA_BASE_URL}/collector/start",  # Adjust endpoint based on your Brightdata setup
        headers=headers,
        json=payload
    )
    
    if not response.ok:
        raise BrightDataError(f"Failed to start collection: {response.text}")
    
    return response.json()

def get_collection_status(collection_id: str) -> Dict:
    """
    Check the status of a collection
    Args:
        collection_id: The ID returned by trigger_collection
    Returns:
        Dict containing status information
    """
    headers = {
        "Authorization": f"Bearer {BRIGHTDATA_API_KEY}",
    }
    
    response = requests.get(
        f"{BRIGHTDATA_BASE_URL}/collector/{collection_id}",
        headers=headers
    )
    
    if not response.ok:
        raise BrightDataError(f"Failed to get collection status: {response.text}")
    
    return response.json()

def get_collection_results(collection_id: str) -> Dict:
    """
    Get the results of a completed collection
    Args:
        collection_id: The ID returned by trigger_collection
    Returns:
        Dict containing the scraped data
    """
    headers = {
        "Authorization": f"Bearer {BRIGHTDATA_API_KEY}",
    }
    
    response = requests.get(
        f"{BRIGHTDATA_BASE_URL}/collector/{collection_id}/download",
        headers=headers
    )
    
    if not response.ok:
        raise BrightDataError(f"Failed to get collection results: {response.text}")
    
    return response.json()

def main():
    pass

if __name__ == "__main__":
    main()