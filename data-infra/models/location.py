from sqlalchemy import Column, String, Float, text
from sqlalchemy.orm import relationship
from .. import Base

class Location(Base):
    __tablename__ = "location"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    city = Column(String)
    country = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    country_code = Column(String)

    # Relationships
    alumni = relationship("Alumni", back_populates="location")
    roles = relationship("Role", back_populates="location")
    problematic = relationship("ProblematicLocation", back_populates="location") 