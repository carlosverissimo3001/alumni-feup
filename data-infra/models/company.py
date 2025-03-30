from sqlalchemy import Column, String, ForeignKey, text, ARRAY
from sqlalchemy.orm import relationship
from .. import Base

from enum import Enum


class CompanyStatus(Enum):
    ACTIVE = "ACTIVE"
    ACQUIRED = "ACQUIRED"
    CLOSED = "CLOSED"


class Company(Base):
    __tablename__ = "company"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String)
    linkedin_url = Column(String, nullable=True)
    industry_id = Column(String, ForeignKey("industry.id"), index=True, unique=True)
    logo = Column(String, nullable=True)
    previous_names = Column(ARRAY(String), nullable=True)
    merged_into_id = Column(String, ForeignKey("company.id"), nullable=True)

    # Relationships
    industry = relationship("Industry", back_populates="companies")
    roles = relationship("Role", back_populates="company")

    def __repr__(self):
        return f"Company(name={self.name}, linkedin_url={self.linkedin_url}, industry_id={self.industry_id}, logo={self.logo}, previous_names={self.previous_names}, merged_into_id={self.merged_into_id})"
