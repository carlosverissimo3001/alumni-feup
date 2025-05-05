import enum
from typing import List, Optional

from langgraph.graph import add_messages
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict


class LocationType(str, enum.Enum):
    ALUMNI = "ALUMNI"
    ROLE = "ROLE"
    COMPANY = "COMPANY"


class LocationInput(BaseModel):
    type: LocationType


class AlumniLocationInput(LocationInput):
    type: LocationType = LocationType.ALUMNI
    # # https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint
    alumni_id: str = Field(..., description="The alumni ID to resolved the location for")
    country_code: str = Field(..., description="The country code of the location", example="PT")
    city: str = Field(..., description="The city of the location", example="Porto")
    country: str = Field(..., description="The country of the location", example="Portugal")


class RoleLocationInput(LocationInput):
    type: LocationType = LocationType.ROLE
    # # https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint
    role_id: str = Field(..., description="The role ID to resolved the location for")
    location: str = Field(
        ..., description="The location of the role, in free-form text", example="Porto, Portugal"
    )


class CompanyLocationInput(LocationInput):
    type: LocationType = LocationType.COMPANY
    # # https://brightdata.com/cp/scrapers/no_code/gd_l1vikfnt1wgvvqz95w/pdp/dictionary?id=hl_15d1aa46
    company_id: str = Field(..., description="The company ID to resolved the location for")
    headquarters: str = Field(
        ...,
        description="The headquarters of the company, usually in the format 'City, Country/State'",
        example="Porto, Portugal",
    )
    country_codes: str = Field(
        ..., description="The country codes where the company does business in", example="PT,ES,FR"
    )


class LocationResult(BaseModel):
    # Will be undefined if this is a new location
    id: Optional[str]

    # Allways defined, unless the agent is unable to resolve a country code
    # Locations like 'Worldwide', 'EMEA', 'MESAM', are not defined in the database
    country_code: str
    country: str
    is_country_only: bool

    # Note that city can be optional if the alumni/company/role only has something like "United States" or "Portugal"
    city: Optional[str]


class LocationAgentState(TypedDict):
    # The agent is used to compute the location of a role, company or alumni
    input: LocationInput
    type: LocationType
    messages: Annotated[list, add_messages]

    # This is the first step of the agent, where we resolve a coutry code
    resolved_country_code: str
    resolved_city: str

    # Then we fetch all the locaitons in the database for this country code
    db_locations: List[LocationResult]

    # What will be used to update the database
    location_result: LocationResult

    # Metadata
    processing_time: float
    model_used: str
