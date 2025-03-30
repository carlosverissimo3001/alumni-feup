from sqlalchemy import Column, String, DateTime
from .. import Base

class AlumniRaw(Base):
    __tablename__ = "alumni_raw"

    id = Column(String, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default='now()') 