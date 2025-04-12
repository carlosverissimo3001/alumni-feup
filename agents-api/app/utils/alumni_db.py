import logging

from sqlalchemy.orm import Session

from app.db.models import Alumni

logger = logging.getLogger(__name__)
def update_alumni(alumni: Alumni, db: Session) -> None:
    """
    Update a alumni record with new data.

    Args:
        alumni: Alumni object with updated fields
        db: Database session
        
    Returns:
        Updated alumni record
    """
    
    logger.info(f"Updating alumni {alumni.id} in the database")
    
    existing_alumni = db.query(Alumni).filter(Alumni.id == alumni.id).first()
    if existing_alumni:
        for key, value in vars(alumni).items():
            if not key.startswith('_') and key != 'id' and value is not None:
                setattr(existing_alumni, key, value)
        
        db.commit()
        db.refresh(existing_alumni)

def get_all_alumni_with_profile_picture_url(db: Session) -> list[Alumni]:
    return db.query(Alumni).filter(Alumni.profile_picture_url is not None).all()



