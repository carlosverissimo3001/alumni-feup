import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.linkedin import LinkedInProfileRequest, LinkedInProfileResponse
from app.services.linkedin import extract_profile_data

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/extract-profile",
    response_model=LinkedInProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def extract_linkedin_profile(
    profile_data: LinkedInProfileRequest,
    db: Session = Depends(get_db),
):
    """
    Extract data from a LinkedIn profile and return structured information.
    Optionally store the data in the database if persist=True.
    """
    try:
        logger.info(f"Extracting LinkedIn profile data from: {profile_data.profile_url}")

        # Call service to extract profile data
        profile_response = await extract_profile_data(
            profile_url=str(profile_data.profile_url),
            include_experiences=profile_data.include_experiences,
            include_education=profile_data.include_education,
            include_skills=profile_data.include_skills,
        )

        return profile_response

    except Exception as e:
        logger.error(f"Error extracting LinkedIn profile data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error extracting LinkedIn profile data",
        )
