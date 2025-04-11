from sqlalchemy.orm import Session

from app.db.models import Industry


def get_industry_by_name(name: str, db: Session) -> Industry | None:
    return db.query(Industry).filter(Industry.name == name).first()

