import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.linkedin import LinkedInExtractProfileRequest, LinkedInUpdateProfileRequest
from app.tasks.queue import task_queue

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/extract-profile",
    status_code=status.HTTP_200_OK,
)
async def extract_linkedin_profiles(
    profile_data: LinkedInExtractProfileRequest,
):
    """
    Triggers the extraction of Linkedin Profiles.
    """
    try:
        logger.info(
            f"Received request to extract LinkedIn profile data for {len(profile_data.alumni_ids)} alumni"
        )
        for alumni_id in profile_data.alumni_ids:
            logger.info(f"Extracting LinkedIn profile data from: {alumni_id}")

            await task_queue.enqueue("extract_linkedin_profile", alumni_id=alumni_id)

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
):
    """
    Triggers the update of Linkedin Profiles.
    If no data is provided, all LinkedIn profiles in the database will be updated.
    """
    try:
        logger.info(
            f"Received request to update LinkedIn profile data for {len(profile_data.alumni_ids)} alumni"
        )

        await task_queue.enqueue("update_linkedin_profiles", alumni_ids=profile_data.alumni_ids)

        # Return immediately, let the background task handle the rest
        return {"status": "processing"}

    except Exception as e:
        logger.error(f"Error updating LinkedIn profile data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating LinkedIn profile data: {str(e)}",
        )
