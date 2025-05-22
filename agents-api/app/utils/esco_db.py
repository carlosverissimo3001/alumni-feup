import json
import logging
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

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
    # 1. Delete existing classifications
    delete_existing_classifications(db, state["role"].role_id)

    # 2. Parse the results to DB format
    results_from_agent = state["esco_results_from_agent"]
    results: List[EscoResult] = []
    if isinstance(results_from_agent, str):
        try:
            parsed_results = json.loads(results_from_agent)
            results = [EscoResult(**result) for result in parsed_results]
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return
    else:
        results = results_from_agent

    # 3. Get the best result
    best_result = results[0]
    model_used = state.get("model_used", "mistral:7b")

    # 4. Insert the classifications into the DB
    # Convert the Pydantic models to dictionaries for JSON serialization
    metadata_json = [result.model_dump() for result in results]
    
    
    classification = JobClassification(
        role_id=state["role"].role_id,
        esco_classification_id=best_result.id,
        confidence=best_result.confidence,
        model_used=model_used,
        metadata_=metadata_json,
    )
    
    insert_classification(db, classification)
