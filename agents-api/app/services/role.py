import logging
import random

from app.db.session import get_db
from app.utils.location_db import get_all_locations
from app.utils.role_db import get_all_roles, update_role

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

class RoleService:
    def assign_random_location_to_roles(self) -> None:
        no_location_roles = get_all_roles(db)
        all_locations = get_all_locations(db)
        
        for role in no_location_roles:
            location = random.choice(all_locations)
            role.location_id = location.id
            update_role(role, db)

role_service = RoleService()