import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import EscoClassification, JobClassification
from app.schemas.job_classification import (
    ClassificationWriteOutcome,
    EscoResult,
    JobClassificationAgentState,
)

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
    """Delete existing classifications for a role."""
    db.query(JobClassification).filter(JobClassification.role_id == role_id).delete()


def _build_classification(
    role_id: str, parsed: Optional[list], model_used: str, reasoning: str
) -> JobClassification:
    """Validate replacement data and build the row to write.

    Raises on anything invalid. Callers must only delete the existing row
    once this succeeds, so a parse failure never leaves a role with its old
    classification deleted and nothing written in its place.
    """
    if not parsed:
        raise ValueError("No parsed ESCO results available")

    results = [EscoResult(**result) for result in parsed]
    if not results:
        raise ValueError("No valid ESCO results to save")

    best_result = results[0]
    metadata_json = {
        "choices": [result.model_dump() for result in results],
        "reasoning": reasoning,
    }

    return JobClassification(
        role_id=role_id,
        esco_classification_id=best_result.id,
        confidence=best_result.confidence,
        model_used=model_used,
        metadata_=metadata_json,
    )


def update_role_with_classifications(db: Session, state: JobClassificationAgentState) -> bool:
    """Replace a role's classification. Returns True iff the write committed.

    The replacement is fully validated before the existing row is touched,
    so a bad payload is a no-op rather than a silent deletion.
    """
    if state.get("error"):
        logger.error(f"Skipping DB update due to error: {state['error']}")
        return False

    role_id = state["role"].role_id
    existing = (
        db.query(JobClassification.was_accepted_by_user, JobClassification.was_modified_by_user)
        .filter(JobClassification.role_id == role_id)
        .first()
    )
    if existing and (existing.was_accepted_by_user or existing.was_modified_by_user):
        logger.info(
            f"Skipping classification update for role {role_id}: protected by user feedback"
        )
        return True

    try:
        classification = _build_classification(
            role_id=state["role"].role_id,
            parsed=state.get("parsed_esco_results"),
            model_used=state.get("model_used", "mistral:7b"),
            reasoning=state.get("reasoning") or "",
        )
    except Exception as e:
        logger.error(f"Error validating ESCO results, skipping DB update: {str(e)}")
        return False

    try:
        delete_existing_classifications(db, state["role"].role_id)
        db.add(classification)
        db.commit()
        db.refresh(classification)
    except Exception as e:
        logger.error(f"Error replacing classification in DB: {str(e)}")
        db.rollback()
        return False

    return True


def sanitize_json(obj):
    """Remove NULL characters from strings in a JSON object."""
    if isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(item) for item in obj]
    elif isinstance(obj, str):
        return obj.replace("\x00", "").replace("\u0000", "")
    return obj


async def update_role_with_classifications_batch(
    db: Session, updates: List[dict], action_by: Optional[str] = None
) -> List[ClassificationWriteOutcome]:
    """Batch update role classifications, returning a typed outcome per role.

    Every update is validated first; only roles with a valid replacement get
    their existing classification deleted, and that delete + insert happen in
    the same commit. A role that fails validation is reported as a failed
    outcome and is left with whatever classification it already had.
    """
    role_ids_to_replace: List[str] = []
    pending_classifications: List[JobClassification] = []
    outcomes: dict[str, ClassificationWriteOutcome] = {}

    # CAR-480: an accepted or user-modified classification is feedback the
    # profile UI already wrote (api's alumni-profile.service.ts) - the
    # standard flow only ever classifies roles with no existing row, but this
    # batch writer is also reachable from retries and other callers that
    # don't pre-filter, so the protection has to live here, not just upstream.
    requested_role_ids = [update["role_id"] for update in updates]
    protected_role_ids = {
        row.role_id
        for row in db.query(JobClassification.role_id)
        .filter(
            JobClassification.role_id.in_(requested_role_ids),
            (JobClassification.was_accepted_by_user.is_(True))
            | (JobClassification.was_modified_by_user.is_(True)),
        )
        .all()
    }

    for update in updates:
        role_id = update["role_id"]

        if role_id in protected_role_ids:
            logger.info(
                f"Skipping classification update for role {role_id}: protected by user feedback"
            )
            outcomes[role_id] = ClassificationWriteOutcome(role_id=role_id, success=True)
            continue

        if not update["classifications"]:
            logger.warning(f"No classifications for role {role_id}, skipping")
            outcomes[role_id] = ClassificationWriteOutcome(
                role_id=role_id, success=False, error="No classifications provided"
            )
            continue

        try:
            sanitized_classifications = sanitize_json(update["classifications"])
            results = [EscoResult(**result) for result in sanitized_classifications]
            if not results:
                raise ValueError("No valid ESCO results to save")

            best_result = results[0]
            metadata_json = {
                "choices": [result.model_dump() for result in results],
                "reasoning": sanitize_json(update.get("reasoning", "")),
            }
            classification = JobClassification(
                role_id=role_id,
                esco_classification_id=best_result.id,
                confidence=best_result.confidence,
                model_used=settings.OPENAI_DEFAULT_MODEL,
                metadata_=metadata_json,
                created_by=action_by,
                updated_by=action_by,
            )
        except Exception as e:
            logger.error(f"Error validating ESCO results for role {role_id}: {str(e)}")
            outcomes[role_id] = ClassificationWriteOutcome(
                role_id=role_id, success=False, error=str(e)
            )
            continue

        role_ids_to_replace.append(role_id)
        pending_classifications.append(classification)

    try:
        for role_id in role_ids_to_replace:
            delete_existing_classifications(db, role_id)
        for classification in pending_classifications:
            db.add(classification)
        db.commit()
    except Exception as e:
        logger.error(f"Error committing batch classification update: {str(e)}")
        db.rollback()
        for role_id in role_ids_to_replace:
            outcomes[role_id] = ClassificationWriteOutcome(
                role_id=role_id, success=False, error=str(e)
            )
        return list(outcomes.values())

    for role_id in role_ids_to_replace:
        outcomes[role_id] = ClassificationWriteOutcome(role_id=role_id, success=True)

    return list(outcomes.values())
