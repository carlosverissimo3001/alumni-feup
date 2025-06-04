import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.db.models import JobClassification, Role, RoleRaw
from app.schemas.job_classification import JobClassificationInput, JobClassificationRoleInput

logger = logging.getLogger(__name__)


def get_all_roles(db: Session):
    return db.query(Role).all()


def get_role_by_id(id: str, db: Session) -> Role:
    return db.query(Role).filter(Role.id == id).first()


def get_roles_by_ids(ids: list[str], db: Session) -> list[Role]:
    return db.query(Role).filter(Role.id.in_(ids)).all()


def get_role_raw_by_id(role_id: str, db: Session) -> RoleRaw:
    return db.query(RoleRaw).filter(RoleRaw.role_id == role_id).first()


def get_roles_by_alumni_id(alumni_id: str, db: Session) -> list[Role]:
    return db.query(Role).filter(Role.alumni_id == alumni_id).all()


def create_role(role: Role, db: Session) -> Role:
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def create_role_raw(role_raw: RoleRaw, db: Session) -> RoleRaw:
    db.add(role_raw)
    db.commit()
    db.refresh(role_raw)
    return role_raw


def get_extended_roles_by_alumni_id(alumni_id: str, db: Session) -> JobClassificationInput:
    roles = (
        db.query(Role)
        .outerjoin(JobClassification, Role.id == JobClassification.role_id)
        .filter(Role.alumni_id == alumni_id)
        .filter(JobClassification.id.is_(None))
        .all()
    )

    return JobClassificationInput(
        alumni_id=alumni_id,
        roles=[
            JobClassificationRoleInput(
                role_id=role.id,
                title=role.role_raw[0].title if role.role_raw else None,
                description=role.role_raw[0].description if role.role_raw else None,
                start_date=role.start_date,
                end_date=role.end_date,
                is_promotion=role.is_promotion,
                company_name=role.company.name,
                industry_name=role.company.industry.name,
            )
            for role in roles
        ],
    )


def update_role(role: Role, db: Session) -> Role:
    existing_role = db.query(Role).filter(Role.id == role.id).first()
    if existing_role:
        for key, value in vars(role).items():
            if not key.startswith("_") and key != "id" and value is not None:
                setattr(existing_role, key, value)
        existing_role.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_role)
    return existing_role


def delete_role(role: Role, db: Session) -> None:
    role = get_role_by_id(role.id, db)

    if role:
        # Delete associated role_raw items
        if hasattr(role, "role_raw") and role.role_raw:
            # Handle as a collection
            for raw in list(role.role_raw):
                db.delete(raw)

        # Delete associated job_classification
        if hasattr(role, "job_classification") and role.job_classification:
            db.delete(role.job_classification)

        # Delete the role itself
        db.delete(role)
        db.commit()
