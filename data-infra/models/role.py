from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, text
from sqlalchemy.orm import relationship
from .. import Base
from .enums import SeniorityLevel

class Role(Base):
    __tablename__ = "role"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    alumni_id = Column(String, ForeignKey("alumni.id"), index=True)
    company_id = Column(String, ForeignKey("company.id"), index=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True), nullable=True)
    seniority_level = Column(Enum(SeniorityLevel))
    location_id = Column(String, ForeignKey("location.id"), nullable=True, index=True)

    # Relationships
    company = relationship("Company", back_populates="roles")
    alumni = relationship("Alumni", back_populates="roles")
    location = relationship("Location", back_populates="roles")
    job_classifications = relationship("JobClassification", back_populates="role") 
    role_raw = relationship("RoleRaw", back_populates="role")

