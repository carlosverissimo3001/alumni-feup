import logging
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def al(alumni_id: str, background_tasks: BackgroundTasks):
    """
    Triggers the classification of all the roles of an alumni into the ESCO taxonomy.
    """
    try:
        logger.info(f"Classifying roles for alumni {alumni_id}")

        background_tasks.add_task(
            job_classification_service.classify_roles_for_alumni,
            alumni_id=alumni_id,
        )

    except Exception as e:
        logger.error(f"Error classifying job title: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error classifying job title",
        )
