from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime


class LinkedInProfileRequest(BaseModel):
    """Schema for requesting LinkedIn profile data extraction."""

    profile_url: HttpUrl = Field(..., description="URL of the LinkedIn profile to extract")
    include_experiences: bool = Field(
        True, description="Include work experiences in the extraction"
    )
    include_education: bool = Field(
        True, description="Include education information in the extraction"
    )
    include_skills: bool = Field(True, description="Include skills in the extraction")


class ExperienceBase(BaseModel):
    """Base schema for work experience."""

    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False


class EducationBase(BaseModel):
    """Base schema for education."""

    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class SkillBase(BaseModel):
    """Base schema for skill."""

    name: str
    endorsements: Optional[int] = 0


class LinkedInProfileResponse(BaseModel):
    """Schema for LinkedIn profile data extraction response."""

    profile_url: str
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experiences: Optional[List[ExperienceBase]] = None
    education: Optional[List[EducationBase]] = None
    skills: Optional[List[SkillBase]] = None
    extraction_timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
