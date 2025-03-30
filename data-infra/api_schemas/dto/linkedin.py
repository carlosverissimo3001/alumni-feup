from typing import List
from pydantic import BaseModel, Field

class StartLinkedInExtractionParams(BaseModel):
    linkedin_urls: List[str] = Field(..., description="The LinkedIn URLs of the users to extract")
