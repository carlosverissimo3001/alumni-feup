from sqlalchemy import Column, String, ForeignKey, text
from sqlalchemy.orm import relationship
from .. import Base

class RoleRaw(Base):
    __tablename__ = "role_raw"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    role_id = Column(String, ForeignKey("role.id"), index=True)
    description = Column(String)

    role = relationship("Role", back_populates="role_raw")