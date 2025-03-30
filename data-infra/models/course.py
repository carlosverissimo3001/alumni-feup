from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .. import Base
from .enums import CourseType, CourseStatus

class Course(Base):
    __tablename__ = "course"

    id = Column(String, primary_key=True)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default='now()')
    acronym = Column(String)
    end_year = Column(Integer, nullable=True)
    status = Column(Enum(CourseStatus), default=CourseStatus.ACTIVE)
    faculty_id = Column(String)
    name_int = Column(String, nullable=True)
    course_type = Column(Enum(CourseType))
    start_year = Column(Integer)

    # Relationships
    course_extractions = relationship("CourseExtraction", back_populates="course")
    graduations = relationship("Graduation", back_populates="course") 