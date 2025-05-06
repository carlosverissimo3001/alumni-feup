import json
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import EscoClassification, JobClassification
from app.schemas.job_classification import JobClassificationAgentState, EscoResult


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

def update_role_with_classifications(db: Session, state: JobClassificationAgentState, level: int):
    # 1. Delete existing classifications
    delete_existing_classifications(db, state["role"].role_id)
    
    # 2. Parse the results to DB format
    results_from_agent = state["esco_results_from_agent"]
    results: List[EscoResult] = []
    if isinstance(results_from_agent, str):
        try:
            parsed_results = json.loads(results_from_agent)
            results = [EscoResult(**result, level=level) for result in parsed_results]
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return
    else:
        results = results_from_agent
    
    # 3. Sort from best to worst confidence
    results = sorted(results, key=lambda x: x.confidence, reverse=True)
    model_used = state.get("model_used", "mistral:7b")
    
    # 4. Insert the classifications into the DB
    for i, result in enumerate(results):
        classification = JobClassification(
            title=result.title,
            level=level,
            ranking=i + 1,
            esco_code=result.code,
            role_id=state["role"].role_id,
            confidence=result.confidence,
            model_used=model_used
        )
        insert_classification(db, classification)
