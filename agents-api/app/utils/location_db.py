from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import Location


def create_location(
    location: Location, db: Session
) -> Location:
    db.add(location)
    db.commit()
    db.refresh(location)
    return location

def get_location(
    city: Optional[str], country: Optional[str], country_code: Optional[str], db: Session
) -> Location | None:
    """
    Get a location by city, country, and country code.
    
    Args:
        city: The city of the location.
        country: The country of the location.
        country_code: The country code of the location.
        db: The database session.
        
    Returns:
        The location object.
    """
    return (
        db.query(Location)
        .filter(
            Location.city == city,
            Location.country == country,
            Location.country_code == country_code,
        )
        .first()
    )

def get_all_locations(db: Session) -> list[Location]:
    return db.query(Location).all()

def get_locations_by_country_code(country_code: str, db: Session) -> list[Location]:
    return db.query(Location).filter(Location.country_code == country_code).all()

def update_location(location: Location, db: Session) -> Location:
    """
    Update a location record with new data.

    Args:
        location: Location object with updated fields
        db: Database session

    Returns:
        Updated location record
    """

    existing_location = db.query(Location).filter(Location.id == location.id).first()
    if existing_location:
        for key, value in vars(location).items():
            if not key.startswith("_") and key != "id" and value is not None:
                setattr(existing_location, key, value)

        existing_location.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing_location)
    return existing_location


