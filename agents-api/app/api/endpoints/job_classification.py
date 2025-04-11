import logging
import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.db.models import JobClassification as JobClassificationModel
from app.schemas.job_classification import (
    JobClassificationRequest,
    JobClassificationResponse,
    EscoResult,
)
from app.services.job_classification import classify_job_title

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_model=JobClassificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def classify_job(
    job_data: JobClassificationRequest,
    db: Session = Depends(get_db),
):
    """
    Classify a job title according to ESCO taxonomy using an LLM agent.
    Optionally provide a job description for more accurate classification.
    """
    try:
        logger.info(f"Classifying job title: {job_data.title}")
        start_time = time.time()

        # Get classification from service
        esco_results = await classify_job_title(
            job_title=job_data.title,
            job_description=job_data.description,
        )

        processing_time = time.time() - start_time

        # Create a response
        response = JobClassificationResponse(
            id="temp-id",  # Will be replaced after DB insertion
            title=job_data.title,
            description=job_data.description,
            results=esco_results,
            processing_time=processing_time,
            model_used="ollama-llama3",
        )

        # Store the results in database
        # We'll just store the top result for now
        top_result = esco_results[0]

        db_job_classification = JobClassificationModel(
            title=job_data.title,
            level=top_result.level,
            esco_code=top_result.code,
            confidence=top_result.confidence,
            # This would be associated with a role if we had one
        )

        db.add(db_job_classification)
        db.commit()
        db.refresh(db_job_classification)

        # Update the response with the actual ID
        response.id = str(db_job_classification.id)

        return response

    except Exception as e:
        logger.error(f"Error classifying job title: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error classifying job title",
        )
