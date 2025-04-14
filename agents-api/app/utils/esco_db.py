from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import EscoClassification


def get_all_classifications_by_level(db: Session, level: int):
    return (
        db.execute(select(EscoClassification).where(EscoClassification.level == level))
        .scalars()
        .all()
    )


def get_all_classification_by_codes(db: Session, codes: List[str]):
    return (
        db.execute(select(EscoClassification).where(EscoClassification.code.in_(codes)))
        .scalars()
        .all()
    )
