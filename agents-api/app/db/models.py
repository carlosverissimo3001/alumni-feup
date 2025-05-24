import enum
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.utils.consts import DEFAULT_INDUSTRY_ID


class Source(str, enum.Enum):
    FORM_SUBMISSION = "FORM_SUBMISSION"
    ADMIN_IMPORT = "ADMIN_IMPORT"
    HONORARY_MEMBER = "HONORARY_MEMBER"


class CourseType(str, enum.Enum):
    INTEGRATED_MASTERS = "INTEGRATED_MASTERS"
    BACHELORS = "BACHELORS"
    MASTERS = "MASTERS"
    DOCTORATE = "DOCTORATE"


class CourseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class SeniorityLevel(str, enum.Enum):
    INTERN = "INTERN"
    ENTRY_LEVEL = "ENTRY_LEVEL"
    ASSOCIATE = "ASSOCIATE"
    MID_SENIOR_LEVEL = "MID_SENIOR_LEVEL"
    DIRECTOR = "DIRECTOR"
    EXECUTIVE = "EXECUTIVE"
    C_LEVEL = "C_LEVEL"


class CompanySize(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    F = "F"
    G = "G"
    H = "H"
    I = "I"


class CompanyType(str, enum.Enum):
    EDUCATIONAL = "EDUCATIONAL"
    GOVERNMENT_AGENCY = "GOVERNMENT_AGENCY"
    NON_PROFIT = "NON_PROFIT"
    PARTNERSHIP = "PARTNERSHIP"
    PRIVATELY_HELD = "PRIVATELY_HELD"
    PUBLIC_COMPANY = "PUBLIC_COMPANY"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    SELF_OWNED = "SELF_OWNED"


class Alumni(Base):
    __tablename__ = "alumni"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    full_name = Column(String, nullable=True)

    linkedin_url = Column(String, nullable=True, unique=True)
    profile_picture_url = Column(String, nullable=True)

    current_location_id = Column(String, ForeignKey("location.id"), nullable=True)

    created_at = Column(DateTime, nullable=False, server_default="now()")
    created_by = Column(String, nullable=True)
    updated_at = Column(
        DateTime, nullable=False, server_default="now()", onupdate=datetime.now(timezone.utc)
    )
    updated_by = Column(String, nullable=True)
    metadata_ = Column(JSONB, name="metadata", nullable=True)

    source = Column(Enum(Source), nullable=True)
    has_sigarra_match = Column(Boolean, nullable=False)
    was_reviewed = Column(Boolean, nullable=False, server_default="false")

    person_id = Column(String, nullable=True)
    personal_email = Column(String, nullable=True)

    location = relationship("Location", back_populates="alumni")
    graduations = relationship("Graduation", back_populates="alumni")
    roles = relationship("Role", back_populates="alumni")


class Company(Base):
    __tablename__ = "company"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    name = Column(String, nullable=False)
    linkedin_url = Column(String, nullable=True, unique=True)
    levels_fyi_url = Column(String, nullable=True)
    industry_id = Column(
        String, ForeignKey("industry.id"), nullable=False, default=DEFAULT_INDUSTRY_ID
    )  # noqa: E501
    logo = Column(String, nullable=True)
    hq_location_id = Column(String, ForeignKey("location.id"), nullable=True)

    founded = Column(Integer, nullable=True)
    website = Column(String, nullable=True)
    company_type = Column(Enum(CompanyType), nullable=True)
    company_size = Column(Enum(CompanySize), nullable=True)

    created_at = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(
        DateTime, nullable=False, server_default="now()", onupdate=datetime.now(timezone.utc)
    )

    industry = relationship("Industry", back_populates="companies")
    roles = relationship("Role", back_populates="company")
    hq_location = relationship("Location", back_populates="company")


class Course(Base):
    __tablename__ = "course"

    id = Column(String, primary_key=True, server_default="uuid_generate_v4()")
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default="now()")
    acronym = Column(String, nullable=False)
    end_year = Column(Integer, nullable=True)
    status = Column(Enum(CourseStatus), nullable=False, server_default="ACTIVE")
    faculty_id = Column(String, nullable=False)
    name_int = Column(String, nullable=True)
    course_type = Column(Enum(CourseType), nullable=False)
    start_year = Column(Integer, nullable=False)

    graduations = relationship("Graduation", back_populates="course")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    name_int = Column(String, nullable=False)
    acronym = Column(String, nullable=False)


class Graduation(Base):
    __tablename__ = "graduation"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    alumni_id = Column(String, ForeignKey("alumni.id"), nullable=False)
    course_id = Column(String, ForeignKey("course.id"), nullable=False)
    conclusion_year = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default="now()")

    alumni = relationship("Alumni", back_populates="graduations")
    course = relationship("Course", back_populates="graduations")


class Industry(Base):
    __tablename__ = "industry"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    name = Column(String, nullable=False)

    companies = relationship("Company", back_populates="industry")


class JobClassification(Base):
    __tablename__ = "job_classification"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    esco_classification_id = Column(String, ForeignKey("esco_classification.id"), nullable=True)
    role_id = Column(String, ForeignKey("role.id"), nullable=False, unique=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(
        DateTime, nullable=False, server_default="now()", onupdate=datetime.now(timezone.utc)
    )
    model_used = Column(String, nullable=False)
    metadata_ = Column(JSONB, name="metadata", nullable=True)

    # Each job classification belongs to a single role (one-to-one)
    role = relationship("Role", back_populates="job_classification", uselist=False)
    esco_classification = relationship("EscoClassification", back_populates="job_classification")

class Location(Base):
    __tablename__ = "location"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    country_code = Column(String, nullable=True)
    is_country_only = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(
        DateTime, nullable=False, server_default="now()", onupdate=datetime.now(timezone.utc)
    )
    alumni = relationship("Alumni", back_populates="location")
    problematic_locations = relationship("ProblematicLocation", back_populates="location")
    roles = relationship("Role", back_populates="location")
    company = relationship("Company", back_populates="hq_location")

    def __repr__(self):
        return f"<Location(id={self.id}, city={self.city}, country={self.country}, country_code={self.country_code}, latitude={self.latitude}, longitude={self.longitude})>"


class ProblematicLocation(Base):
    __tablename__ = "problematic_location"

    id = Column(String, primary_key=True, server_default="uuid_generate_v4()")
    location_id = Column(String, ForeignKey("location.id"), nullable=False)
    is_expected = Column(Boolean, nullable=False, server_default="false")

    location = relationship("Location", back_populates="problematic_locations")


class Role(Base):
    __tablename__ = "role"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    alumni_id = Column(String, ForeignKey("alumni.id"), nullable=False)
    company_id = Column(String, ForeignKey("company.id"), nullable=False)
    location_id = Column(String, ForeignKey("location.id"), nullable=True)

    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(
        DateTime, nullable=False, server_default="now()", onupdate=datetime.now(timezone.utc)
    )
    seniority_level = Column(Enum(SeniorityLevel), nullable=False, default=SeniorityLevel.ASSOCIATE)
    is_promotion = Column(Boolean, nullable=False, server_default="false")
    is_current = Column(Boolean, nullable=False, server_default="false")

    # One-to-one relationship with JobClassification
    job_classification = relationship("JobClassification", back_populates="role", uselist=False)
    alumni = relationship("Alumni", back_populates="roles")
    company = relationship("Company", back_populates="roles")
    location = relationship("Location", back_populates="roles")
    role_raw = relationship("RoleRaw", back_populates="role")
    
    metadata_ = Column(JSONB, name="metadata", nullable=True)


class RoleRaw(Base):
    __tablename__ = "role_raw"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default="now()")
    role_id = Column(String, ForeignKey("role.id"), nullable=False)

    role = relationship("Role", back_populates="role_raw")


class EscoClassification(Base):
    __tablename__ = "esco_classification"

    id = Column(String, primary_key=True, server_default="gen_random_uuid()")
    level = Column(SmallInteger, nullable=False)
    code = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    definition = Column(String, nullable=False)
    tasks_include = Column(String, nullable=False)
    included_occupations = Column(String, nullable=False)
    excluded_occupations = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    esco_url = Column(String, nullable=False)
    is_leaf = Column(Boolean, nullable=False, server_default="false", default=False)
    # Using 3072 dimensions for OpenAI's text-embedding-3-large model
    embedding = Column(Vector(3072), nullable=True)
    
    job_classification = relationship("JobClassification", back_populates="esco_classification")

