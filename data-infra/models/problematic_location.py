from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .. import Base

class ProblematicLocation(Base):
    __tablename__ = "problematic_location"

    id = Column(String, primary_key=True)
    location_id = Column(String, ForeignKey("location.id"))

    # Relationships
    location = relationship("Location", back_populates="problematic") 