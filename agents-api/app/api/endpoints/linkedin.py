import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.schemas.linkedin import LinkedInExtractProfileRequest, LinkedInUpdateProfileRequest
from app.services.linkedin import linkedin_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/extract-profile",
    status_code=status.HTTP_200_OK,
)
async def extract_linkedin_profiles(
    profile_data: LinkedInExtractProfileRequest,
    background_tasks: BackgroundTasks,
):
    """
    Triggers the extraction of Linkedin Profiles.
    """
    try:
        logger.info(f"Received request to extract LinkedIn profile data for {len(profile_data.alumni_ids)} alumni")
        for alumni_id in profile_data.alumni_ids:
            logger.info(f"Extracting LinkedIn profile data from: {alumni_id}")
            
            background_tasks.add_task(
                linkedin_service.extract_profile_data,
                alumni_id=alumni_id,
            )
        
        # Return immediately, let the background task handle the rest
        return {"status": "processing"}

    except Exception as e:
        logger.error(f"Error extracting LinkedIn profile data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting LinkedIn profile data: {str(e)}",
        )

@router.post(
    "/update-profile",
    status_code=status.HTTP_200_OK,
)
async def update_linkedin_profiles(
    profile_data: LinkedInUpdateProfileRequest,
    background_tasks: BackgroundTasks,
):
    """
    Triggers the update of Linkedin Profiles.
    If no data is provided, all LinkedIn profiles in the database will be updated.
    """
    try:
        logger.info(f"Received request to update LinkedIn profile data for {len(profile_data.alumni_ids)} alumni")
            
        background_tasks.add_task(
            linkedin_service.update_profile_data,
            alumni_ids=profile_data.alumni_ids,
        )
        
        # Return immediately, let the background task handle the rest
        return {"status": "processing"}

    except Exception as e:
        logger.error(f"Error updating LinkedIn profile data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating LinkedIn profile data: {str(e)}",
        )
