import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.seniority import AlumniSeniorityParams
from app.tasks.queue import task_queue

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    description="Trigger the seniority classification of alumni roles. If no alumni IDs are provided, it will process all alumni.",
)
async def classify_seniority(
    params: AlumniSeniorityParams = Depends(),
):
    """
    Trigger the classification of the roles of the alumni in chronological order.

    If no alumni IDs are provided, it will process all alumni.
    The classification takes into account:
    - Role duration
    - Previous roles and their progression
    - Job type (ESCO classification)
    - Industry standards
    """
    try:
        logger.info(f"Requesting alumni role seniority classification for {params.alumni_ids}")

        await task_queue.enqueue("classify_alumni_seniority", alumni_ids=params.alumni_ids)

        return {"message": "Seniority classification process started"}

    except Exception as e:
        logger.error(f"Error requesting alumni role seniority classification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error requesting alumni role seniority classification",
        )
