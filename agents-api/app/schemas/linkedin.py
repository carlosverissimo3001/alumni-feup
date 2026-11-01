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
    # CAR-481: a successful HTTP response doesn't mean a complete experience
    # list - entries without a start date are dropped by the converter
    # rather than raising. Tracked here instead of silently disappearing, so
    # reconciliation can tell "this person truly has 0 experiences" apart
    # from "N entries were unusable."
    skipped_experience_count: int = 0
    # False when the response had no usable "experiences" field at all (as
    # opposed to a present-but-empty list). Not strong enough evidence to
    # fail the whole extraction on - a genuinely experience-less profile may
    # legitimately omit the field too, and this project has no captured
    # payload proving otherwise either way. Reconciliation uses this to
    # withhold missing-role detection rather than risk flagging every
    # existing role as gone on a response shape it can't fully trust.
    experiences_field_present: bool = True

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
    # CAR-481: distinguish a missing/malformed "experiences" field from a
    # genuinely empty list - see LinkedInProfileResponse.experiences_field_present.
    raw_experiences = json_data.get("experiences")
    experiences_field_present = isinstance(raw_experiences, list)
    if not experiences_field_present:
        logger.warning(
            "LinkedIn response has no usable 'experiences' field - "
            "treating as empty but not as evidence of removed roles"
        )

    experiences = []
    skipped_experience_count = 0
    for exp in raw_experiences or []:
        # No start date? Can't build a Role (start_date is required), so this
        # entry is unusable, not evidence the role doesn't exist.
        if not exp.get("starts_at"):
            skipped_experience_count += 1
            continue

        starts_at = ExperienceDate(**exp["starts_at"])
        ends_at = ExperienceDate(**exp["ends_at"]) if exp.get("ends_at") else None

        experiences.append(
            ExperienceBase(
                title=exp["title"],
                company=exp["company"],
                company_linkedin_profile_url=exp["company_linkedin_profile_url"],
                location=exp.get("location"),
                description=exp.get("description"),
                starts_at=starts_at,
                ends_at=ends_at,
            )
        )

    # Prepare the full response model
    profile = LinkedInProfileResponse(
        profile_pic_url=json_data["profile_pic_url"],
        country=json_data["country"],
        country_full_name=json_data["country_full_name"],
        city=json_data["city"],
        experiences=experiences,
        skipped_experience_count=skipped_experience_count,
        experiences_field_present=experiences_field_present,
    )

    return profile


def convert_to_linkedin_company_response(json_data: dict) -> LinkedInCompanyResponse:
    return LinkedInCompanyResponse(
        name=json_data.get("name"),
        industries=json_data.get("industries"),
        logo=json_data.get("logo"),
        website=json_data.get("website"),
        founded=json_data.get("founded"),
        company_size=json_data.get("company_size"),
        organization_type=json_data.get("organization_type"),
        country_code=json_data.get("country_code"),
        headquarters=json_data.get("headquarters"),
    )
