from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from .. import Base

class JobClassification(Base):
    __tablename__ = "job_classification"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String, index=True)
    level = Column(Integer)
    esco_code = Column(String, nullable=True)
    role_id = Column(String, ForeignKey("role.id"), index=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default='now()')

    # Relationships
    role = relationship("Role", back_populates="job_classifications") 