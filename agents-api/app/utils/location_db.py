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
