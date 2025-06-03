import logging

from app.agents.location import location_agent
from app.db import get_db
from app.db.models import Location
from app.schemas.location import (
    CompanyLocationInput,
    LocationType,
    ResolveAlumniLocationParams,
    ResolveCompanyLocationParams,
    ResolveRoleLocationParams,
    RoleLocationInput,
)
from app.utils.company_db import get_companies_by_ids
from app.utils.role_db import get_roles_by_ids
from app.services.coordinates import coordinates_service

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class LocationService:
    async def request_role_location(self, params: ResolveRoleLocationParams):
        """
        Request the agent to resolve the location of any role.
        """
        role_ids = params.role_ids
        roles = get_roles_by_ids(role_ids.split(","), db)

        for role in roles:
            input = RoleLocationInput(
                type=LocationType.ROLE,
                role_id=role.id,
                location=role.location,
            )

            await location_agent.process_location(input)

    async def request_alumni_location(self, params: ResolveAlumniLocationParams):
        """
        Request the agent to resolve the location of any alumni.
        """
        role_ids = params.role_ids
        roles = get_roles_by_ids(role_ids.split(","), db)

        for role in roles:
            input = RoleLocationInput(
                type=LocationType.ROLE,
                role_id=role.id,
                location=role.location,
            )

            await location_agent.process_location(input)

    async def request_company_location(self, params: ResolveCompanyLocationParams):
        """
        Request the agent to resolve the location of any company.
        """
        company_ids = params.company_ids
        companies = get_companies_by_ids(company_ids.split(","), db)

        for company in companies:
            input = CompanyLocationInput(
                type=LocationType.COMPANY,
                company_id=company.id,
                headquarters=company.headquarters,
            )

            await location_agent.process_location(input)

    async def update_location_coordinates(self, location: Location):
        """
        Get the coordinates of a city from the Geocoding API and update the location object
        """
        await coordinates_service.update_location_coordinates(location)


location_service = LocationService()
