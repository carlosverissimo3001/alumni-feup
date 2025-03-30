from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from .. import Base

class EscoClassification(Base):
    __tablename__ = "esco_classification"

    id = Column(String, primary_key=True)
    level = Column(Integer)
    code = Column(String)
    title_en = Column(String)
    definition = Column(String)
    tasks_include = Column(String)
    included_occupations = Column(String)
    excluded_occupations = Column(String)
    notes = Column(String, nullable=True)
 