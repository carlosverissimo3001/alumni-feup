from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from .. import Base

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(String, primary_key=True)
    name = Column(String)
    name_int = Column(String, nullable=True)
    acronym = Column(String, nullable=True)

    # Relationships
    course_extractions = relationship("CourseExtraction", back_populates="faculty") 