import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.schemas.linkedin import LinkedInProfileRequest
from app.services.linkedin import linkedin_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/extract-profile",
    status_code=status.HTTP_200_OK,
)
async def extract_linkedin_profile(
    profile_data: LinkedInProfileRequest,
    background_tasks: BackgroundTasks,
):
    """
    Extract data from a LinkedIn profile and process it.
    Returns a success status without the profile data.
    """
    try:
        logger.info(f"Extracting LinkedIn profile data from: {profile_data.profile_url}")
        
        background_tasks.add_task(
            linkedin_service.extract_profile_data,
            profile_url=str(profile_data.profile_url),
            alumni_id=profile_data.alumni_id,
        )
        
        # Return immediately, let the background task handle the rest
        return {"status": "processing"}

    except Exception as e:
        logger.error(f"Error extracting LinkedIn profile data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting LinkedIn profile data: {str(e)}",
        )
