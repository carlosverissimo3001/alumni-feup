from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .. import Base

class CourseExtraction(Base):
    __tablename__ = "course_extraction"

    id = Column(String, primary_key=True)
    full_name = Column(String)
    faculty_id = Column(String, ForeignKey("faculty.id"))
    course_id = Column(String, ForeignKey("course.id"))
    student_id = Column(String)
    conclusion_year = Column(Integer)
    parsed = Column(Boolean, default=False)
    parsed_at = Column(DateTime, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="course_extractions")
    faculty = relationship("Faculty", back_populates="course_extractions") 