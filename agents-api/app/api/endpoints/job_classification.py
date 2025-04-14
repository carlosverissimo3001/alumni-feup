import logging
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.schemas.job_classification import EscoResult
from app.services.job_classification import job_classification_service
from app.utils.agents.esco_reference import search_esco_classifications

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def classify_job(alumni_id: str, background_tasks: BackgroundTasks):
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


@router.post(
    "/raw",
    response_model=List[EscoResult],
    status_code=status.HTTP_201_CREATED,
)
async def classify_job_raw(query: str):
    """
    Test endpoint that takes in a query (some job title and description) and returns a
    list of ESCO classifications.
    """
    try:
        logger.info(f"Classifying job {query}")

        results = await search_esco_classifications.ainvoke(query)
        return results

    except Exception as e:
        logger.error(f"Error classifying job title: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error classifying job title: {str(e)}",
        )
