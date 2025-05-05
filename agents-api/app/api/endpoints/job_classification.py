import logging
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.schemas.job_classification import AlumniJobClassificationParams, EscoResult
from app.services.job_classification import job_classification_service
from app.utils.agents.esco_reference import search_esco_classifications

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def classify_job(
    background_tasks: BackgroundTasks,
    params: AlumniJobClassificationParams = Depends(),
):
    """
    Triggers the classification of all the roles of an alumni into the ESCO taxonomy.
    """
    try:
        logger.info(f"Requesting alumni role classification for {params.alumni_ids}")

        background_tasks.add_task(
            job_classification_service.request_alumni_classification,
            params=params,
        )

    except Exception as e:
        logger.error(f"Error requesting alumni role classification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error requesting alumni role classification",
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
