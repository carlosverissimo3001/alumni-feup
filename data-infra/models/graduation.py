from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, text
from sqlalchemy.orm import relationship
from .. import Base
from datetime import datetime

class Graduation(Base):
    __tablename__ = "graduation"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    alumni_id = Column(String, ForeignKey("alumni.id"), index=True)
    course_id = Column(String, ForeignKey("course.id"), index=True)
    conclusion_year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    alumni = relationship("Alumni", back_populates="graduations")
    course = relationship("Course", back_populates="graduations") 