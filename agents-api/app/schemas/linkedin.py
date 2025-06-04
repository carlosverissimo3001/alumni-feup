import logging
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl

logger = logging.getLogger(__name__)

class AlumniData(BaseModel):
    """Schema for alumni data."""

    alumni_id: str = Field(..., description="ID of the alumni to link data with")
    profile_url: HttpUrl = Field(..., description="URL of the LinkedIn profile to extract")

class LinkedInExtractProfileRequest(BaseModel):
    """Schema for requesting LinkedIn profile data extraction."""

    alumni_ids: List[str] = Field(..., description="List of alumni IDs to extract")


class LinkedInUpdateProfileRequest(BaseModel):
    """Schema for requesting LinkedIn profile data extraction."""

    alumni_ids: List[str] = Field(..., description="List of alumni IDs to update")

class ExperienceDate(BaseModel):
    """Schema for experience date."""

    year: int
    month: int
    day: int

class ExperienceBase(BaseModel):
    """Base schema for work experience."""

    company: Optional[str] = None
    company_linkedin_profile_url: Optional[str] = None
    description: Optional[str] = None
    ends_at: Optional[ExperienceDate] = None
    location: Optional[str] = None
    starts_at: ExperienceDate
    title: str

class LinkedInProfileResponse(BaseModel):
    """Schema for LinkedIn profile data extraction response."""

    profile_pic_url: Optional[str] = None
    # The user's country of residence depicted by a 2-letter country code (ISO 3166-1 alpha-2).
    country: Optional[str] = None
    # The user's country of residence, in English words.
    country_full_name: Optional[str] = None
    city: Optional[str] = None
    experiences: List[ExperienceBase]

    class Config:
        from_attributes = True


class LinkedInCompanyResponse(BaseModel):
    """Schema for LinkedIn company data extraction response."""

    name: Optional[str] = None
    # This is a string, not a list, they really need better naming
    industries: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    crunchbase_url: Optional[str] = None
    founded: Optional[int] = None
    company_size: Optional[str] = None
    organization_type: Optional[str] = None
    
    # Headquarters info
    country_code: Optional[str] = None
    headquarters: Optional[str] = None


def convert_to_linkedin_profile_response(json_data: dict) -> LinkedInProfileResponse:
    experiences = []
    for exp in json_data.get('experiences', []):
        # No start date?
        if not exp.get('starts_at'):
            continue
        
        starts_at = ExperienceDate(**exp['starts_at'])
        ends_at = ExperienceDate(**exp['ends_at']) if exp.get('ends_at') else None
                
        experiences.append(ExperienceBase(
            title=exp['title'],
            company=exp['company'],
            company_linkedin_profile_url=exp['company_linkedin_profile_url'],
            location=exp.get('location'),
            description=exp.get('description'),
            starts_at=starts_at,
            ends_at=ends_at,
        ))

    # Prepare the full response model
    profile = LinkedInProfileResponse(
        profile_pic_url=json_data['profile_pic_url'],
        country=json_data['country'],
        country_full_name=json_data['country_full_name'],
        city=json_data['city'],
        experiences=experiences
    )

    return profile

def convert_to_linkedin_company_response(json_data: dict) -> LinkedInCompanyResponse:    
    return LinkedInCompanyResponse(
        name=json_data.get('name'),
        industries=json_data.get('industries'),
        logo=json_data.get('logo'),
        website=json_data.get('website'),
        founded=json_data.get('founded'),
        company_size=json_data.get('company_size'),
        organization_type=json_data.get('organization_type'),
        country_code=json_data.get('country_code'),
        headquarters=json_data.get('headquarters'),
    )

