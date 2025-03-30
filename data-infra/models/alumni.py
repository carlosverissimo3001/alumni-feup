from sqlalchemy import Column, String, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from .. import Base

class Alumni(Base):
    __tablename__ = "alumni"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    first_name = Column(String)
    last_name = Column(String)
    linkedin_url = Column(String)
    personal_email = Column(String, nullable=True)
    current_location_id = Column(String, ForeignKey("location.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default='now()')
    created_by = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)
    updated_by = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    person_id = Column(String, nullable=True)
    student_id = Column(String, nullable=True)

    # Relationships
    location = relationship("Location", back_populates="alumni")
    graduations = relationship("Graduation", back_populates="alumni")
    roles = relationship("Role", back_populates="alumni") 