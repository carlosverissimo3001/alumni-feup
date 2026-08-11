import logging

from app.core.config import settings
from app.db.models import Location
from app.db.session import session_scope
from app.utils.http_client import HTTPClient
from app.utils.location_db import update_location

logger = logging.getLogger(__name__)


class CoordinatesService:
    def __init__(self):
        """Initialize the Coordinates service with an HTTP client."""
        self.client = HTTPClient(
            timeout=60,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            base_url=settings.GEOLOCATION_BASE_URL,
        )

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    def __del__(self):
        """Ensure sync client is closed when object is destroyed."""
        self.client.close()

    async def update_location_coordinates(self, location_id: str) -> None:
        """Updates the coordinates for a location using a geocoding service.

        Takes an id rather than a model instance, and loads it in its own
        session. Both callers dispatch this as fire-and-forget work - one
        through `_create_background_task` - so it can outlive the scope it was
        started from. A session or a live instance handed in from there would
        already be closed or detached by the time this ran.
        """
        try:
            with session_scope() as db:
                location = db.get(Location, location_id)
                if location is None:
                    logger.warning(f"Location {location_id} no longer exists")
                    return

                response = await self.client.aget_json(
                    f"{location.city},{location.country_code}"
                    f"&limit=1&appid={settings.GEOLOCATION_API_KEY}"
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
            logger.error(f"Error updating coordinates for location {location_id}: {str(e)}")


coordinates_service = CoordinatesService()
