from sqlalchemy import Column, String, text
from sqlalchemy.orm import relationship
from .. import Base

class Industry(Base):
    __tablename__ = "industry"

    id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String, index=True)

    # Relationships
    companies = relationship("Company", back_populates="industry")