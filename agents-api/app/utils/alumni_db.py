import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models import Alumni
from app.utils.role_db import delete_role

logger = logging.getLogger(__name__)

DEFAULT_UPDATED_BY = "agents-api"

def update_alumni(alumni: Alumni, db: Session) -> None:
    """
    Update a alumni record with new data.

    Args:
        alumni: Alumni object with updated fields
        db: Database session

    Returns:
        Updated alumni record
    """

    # logger.info(f"Updating alumni {alumni.id} in the database")

    existing_alumni = db.query(Alumni).filter(Alumni.id == alumni.id).first()
    if existing_alumni:
        for key, value in vars(alumni).items():
            if not key.startswith("_") and key != "id" and value is not None:
                setattr(existing_alumni, key, value)

        existing_alumni.updated_at = datetime.now(timezone.utc)
        existing_alumni.updated_by = DEFAULT_UPDATED_BY
        db.commit()
        db.refresh(existing_alumni)


def find_all(db: Session) -> list[Alumni]:
    return db.query(Alumni).all()

def find_all_with_linkedin(db: Session) -> list[Alumni]:
    """
    Find all alumni records with a non-null LinkedIn URL.

    Args:
        db: Database session

    Returns:
        List of alumni records with non-null LinkedIn URLs
    """
    return db.query(Alumni).filter(Alumni.linkedin_url.isnot(None)).all()
def find_by_id(id: str, db: Session) -> Alumni:
    return db.query(Alumni).filter(Alumni.id == id).first()


def find_by_ids(ids: list[str], db: Session) -> list[Alumni]:
    return db.query(Alumni).filter(Alumni.id.in_(ids)).all()


def delete_profile_data(id: str, db: Session) -> None:
    alumni = find_by_id(id, db)
    if alumni:
        # Get all roles and delete them one by one
        for role in list(alumni.roles):
            delete_role(role, db)

        # Clear other profile data
        alumni.current_location_id = None
        alumni.profile_picture_url = None
        db.commit()
