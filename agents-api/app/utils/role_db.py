import logging

from sqlalchemy.orm import Session

from app.db.models import Role, RoleRaw

logger = logging.getLogger(__name__)

def get_all_roles(db: Session):
    return db.query(Role).all()

def get_role_by_id(id: str, db: Session) -> Role:
    return db.query(Role).filter(Role.id == id).first()

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

def get_all_roles_with_no_location(db: Session) -> list[Role]:
    return db.query(Role).filter(Role.location_id.is_(None)).all()


def update_role(role: Role, db: Session) -> Role:
    existing_role = db.query(Role).filter(Role.id == role.id).first()
    if existing_role:
        for key, value in vars(role).items():
            if not key.startswith('_') and key != 'id' and value is not None:
                setattr(existing_role, key, value)
        
        db.commit()
        db.refresh(existing_role)
    return existing_role



