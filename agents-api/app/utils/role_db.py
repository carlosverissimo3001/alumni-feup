from sqlalchemy.orm import Session

from app.db.models import Role, RoleRaw


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

