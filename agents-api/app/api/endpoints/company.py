import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.company import CompanyUpdateParams
from app.tasks.queue import task_queue

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    status_code=status.HTTP_200_OK,
)
async def request_company_update(
    params: CompanyUpdateParams = Depends(),
):
    """
    Updates the company data by calling the BrightData API.

    If none are provided, it will update all companies.
    """
    try:
        logger.info(f"Requesting company update for {params.company_ids}")
        await task_queue.enqueue("update_companies", company_ids=params.company_ids)

    except Exception as e:
        logger.error(f"Error updating company data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating company data: {e}",
        )
