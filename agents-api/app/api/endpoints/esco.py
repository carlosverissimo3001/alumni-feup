import logging
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.utils.embeddings import update_esco_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post(
    "/generate-embeddings",
    response_model=Dict[str, str],
    status_code=status.HTTP_202_ACCEPTED,
)
async def generate_esco_embeddings(
    db: Session = Depends(get_db),
    batch_size: int = 100,
):
    """
    Triggers the generation of embeddings for all ESCO classifications that don't have them yet.
    The process runs in batches to avoid memory issues.
    """
    try:
        logger.info("Starting ESCO embeddings generation")
        await update_esco_embeddings(db, batch_size)
        return {"status": "Embeddings generation process started"}

    except Exception as e:
        logger.error(f"Error generating ESCO embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating ESCO embeddings: {str(e)}",
        ) 