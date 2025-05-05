import logging

from app.core.config import settings
from app.db import get_db
from app.db.models import Location
from app.utils.http_client import HTTPClient
from app.utils.location_db import update_location

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class LocationService:
    def __init__(self):
        """Initialize the LinkedIn service with an HTTP client."""
        self.client = HTTPClient(
            timeout=60,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            base_url=settings.GEOLOCATION_BASE_URL,
        )

    async def update_location_coordinates(self, location: Location):
        """
        Get the coordinates of a city from the Geocoding API and update the location object
        """
        try:
            response = self.client.get_json(
                f"{location.city},{location.country_code}&limit=1&appid={settings.GEOLOCATION_API_KEY}"
            )
            
            # If the response is empty, we return None
            if not response or len(response) == 0:
                return None
            
            # Assumption that the first item is the one we want
            # 99.999% of the time, it is
            location_data = response[0]
            location.latitude = location_data["lat"]
            location.longitude = location_data["lon"]

            update_location(location, db)

        except Exception as e:
            logger.error(f"Error getting coordinates for location {location}: {e}")


location_service = LocationService()
