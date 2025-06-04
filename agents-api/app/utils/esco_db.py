import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import EscoClassification, JobClassification
from app.schemas.job_classification import EscoResult, JobClassificationAgentState

logger = logging.getLogger(__name__)


def get_all_classifications_by_level(db: Session, level: int) -> List[EscoClassification]:
    return (
        db.execute(select(EscoClassification).where(EscoClassification.level == level))
        .scalars()
        .all()
    )


def get_classification_by_code(db: Session, code: str) -> EscoClassification | None:
    return (
        db.execute(select(EscoClassification).where(EscoClassification.code == code))
        .scalars()
        .first()
    )


def insert_classification(db: Session, classification: JobClassification):
    db.add(classification)
    db.commit()
    db.refresh(classification)
    return classification


def delete_existing_classifications(db: Session, role_id: str):
    db.query(JobClassification).filter(JobClassification.role_id == role_id).delete()


def update_role_with_classifications(db: Session, state: JobClassificationAgentState):
    if state.get("error"):
        logger.error(f"Skipping DB update due to error: {state['error']}")
        return

    delete_existing_classifications(db, state["role"].role_id)

    parsed = state.get("parsed_esco_results")
    if not parsed:
        logger.error("No parsed ESCO results available, skipping DB update.")
        return

    try:
        results = [EscoResult(**result) for result in parsed]
    except Exception as e:
        logger.error(f"Error parsing ESCO results: {str(e)}")
        return

    if not results:
        logger.error("No valid ESCO results to save")
        return

    best_result = results[0]
    model_used = state.get("model_used", "mistral:7b")

    metadata_json = {
        "choices": [result.model_dump() for result in results],
        "reasoning": state.get("reasoning", ""),
    }

    try:
        classification = JobClassification(
            role_id=state["role"].role_id,
            esco_classification_id=best_result.id,
            confidence=best_result.confidence,
            model_used=model_used,
            metadata_=metadata_json,
        )

        insert_classification(db, classification)
    except Exception as e:
        logger.error(f"Error inserting classification into DB: {str(e)}")
        db.rollback()


async def update_role_with_classifications_batch(db: Session, updates: List[dict], action_by: Optional[str] = None):
    """
    Batch update role classifications in the database
    """
    try:
        for update in updates:
            delete_existing_classifications(db, update["role_id"])

            if not update["classifications"]:
                logger.warning(f"No classifications for role {update['role_id']}, skipping")
                continue

            try:
                results = [EscoResult(**result) for result in update["classifications"]]
            except Exception as e:
                logger.error(f"Error parsing ESCO results for role {update['role_id']}: {str(e)}")
                continue

            best_result = results[0]
            metadata_json = {
                "choices": [result.model_dump() for result in results],
                "reasoning": update.get("reasoning", ""),
            }

            try:
                classification = JobClassification(
                    role_id=update["role_id"],
                    esco_classification_id=best_result.id,
                    confidence=best_result.confidence,
                    model_used=settings.OPENAI_DEFAULT_MODEL,
                    metadata_=metadata_json,
                    created_by=action_by,
                    updated_by=action_by,
                )
                db.add(classification)
            except Exception as e:
                logger.error(
                    f"Error creating classification for role {update['role_id']}: {str(e)}"
                )
                continue

        db.commit()
    except Exception as e:
        logger.error(f"Error in batch update: {str(e)}")
        db.rollback()
        raise
