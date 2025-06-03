import asyncio
import json
import logging
import time
from typing import List

import openai
from fastapi.encoders import jsonable_encoder
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from redis import Redis
from tenacity import (
    before_sleep_log,
    retry,
    stop_after_attempt,
    wait_random_exponential,
)

from app.core.config import settings
from app.db import get_db
from app.db.models import Location
from app.schemas.location import LocationAgentState, LocationInput, LocationResult, LocationType
from app.services.coordinates import coordinates_service
from app.utils.alumni_db import find_by_id, update_alumni
from app.utils.company_db import get_company_by_id, update_company
from app.utils.location_db import create_location, get_locations_by_country_code
from app.utils.prompts import RESOLVE_GEO_PROMPT, RESOLVE_LOCATION_PROMPT
from app.utils.role_db import get_role_by_id, update_role

REMOTE_LOCATION_ID = "15045675-0782-458b-9bb7-02567ac246fd"
REMOTE_COUNTRY_CODE = "REMOTE"

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

# JSON schema for location resolution
geo_resolution_schema = {
    "type": "object",
    "properties": {
        "city": {
            "type": ["string", "null"],
            "description": "The standardized city name or null if not available/applicable",
        },
        "country_code": {
            "type": "string",
            "description": "The ISO 3166-1 alpha-2 country code, REMOTE for remote work, or null if unknown",
        },
    },
    "required": ["city", "country_code"],
}

location_resolution_schema = {
    "type": "object",
    "properties": {
        "id": {
            "type": ["string", "null"],
            "description": "The UUID of an existing location, or null for new locations",
        },
        "country_code": {
            "type": "string",
            "description": "The ISO 3166-1 alpha-2 country code",
        },
        "country": {
            "type": "string",
            "description": "The full country name",
        },
        "city": {
            "type": ["string", "null"],
            "description": "The standardized city name or null for country-only locations",
        },
        "is_country_only": {
            "type": "boolean",
            "description": "Whether this is a country-level location (no specific city)",
        },
    },
    "required": ["country_code", "country", "city", "is_country_only"],
}


def return_geo_resolution(results: dict) -> dict:
    return results


def return_location_resolution(results: dict) -> dict:
    return results


# Tools for the agent
geo_tool = Tool.from_function(
    func=return_geo_resolution,
    name="return_geo_resolution",
    description="Return the resolved city and country code",
    args_schema=geo_resolution_schema,
)

location_tool = Tool.from_function(
    func=return_location_resolution,
    name="return_location_resolution",
    description="Return the resolved location object",
    args_schema=location_resolution_schema,
)

tools = [geo_tool, location_tool]

cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    max_retries=3,
    temperature=0.0,
)

llm_with_tools = cold_llm.bind_tools(tools)
tool_node = ToolNode(tools=tools)


class LocationAgent:
    def __init__(self):
        self._redis_cache = Redis(host="localhost", port=6379, db=0)
        self.CACHE_TTL = 60 * 60 * 24  # 24 hours
        self.MAX_RETRIES = 3

    def _get_cache_key(self, location_input: LocationInput) -> str:
        if location_input.type == LocationType.COMPANY:
            return f"location:company:{location_input.headquarters}"
        elif location_input.type == LocationType.ROLE:
            return f"location:role:{location_input.location}"
        else:
            return f"location:alumni:{location_input.city}:{location_input.country}"

    def _get_from_cache(self, location_input: LocationInput) -> LocationResult | None:
        cached = self._redis_cache.get(self._get_cache_key(location_input))
        if cached:
            return LocationResult(**json.loads(cached))
        return None

    def _set_in_cache(self, location_input: LocationInput, result: LocationResult):
        self._redis_cache.setex(
            self._get_cache_key(location_input),
            self.CACHE_TTL,
            json.dumps(jsonable_encoder(result)),
        )

    def _build_input_details(self, location_input: LocationInput) -> str:
        if location_input.type == LocationType.COMPANY:
            return f'Company Headquarters: "{location_input.headquarters}"\nCountry Codes: "{location_input.country_codes}"'
        elif location_input.type == LocationType.ROLE:
            return f'Role Location: "{location_input.location}"'
        elif location_input.type == LocationType.ALUMNI:
            return f'Alumni City: "{location_input.city}"\nAlumni Country: "{location_input.country}"\nAlumni Country Code: "{location_input.country_code}"'

    def create_graph(self) -> StateGraph:
        graph = StateGraph(LocationAgentState)

        # Add nodes
        graph.add_node("resolve_geo", self.resolve_geo)
        graph.add_node("fetch_locations_from_db", self.fetch_locations_from_db)
        graph.add_node("resolve_location", self.resolve_location)
        graph.add_node("update_locations", self.update_locations)

        # Add edges
        graph.add_edge(START, "resolve_geo")
        graph.add_edge("resolve_geo", "fetch_locations_from_db")
        graph.add_edge("fetch_locations_from_db", "resolve_location")
        graph.add_edge("resolve_location", "update_locations")
        graph.add_edge("update_locations", END)

        return graph.compile()

    def resolve_geo(self, state: LocationAgentState) -> LocationAgentState:
        """
        Resolve the country code and city for the location
        """
        clean_input = self._build_input_details(state["input"])

        try:
            response = cold_llm.invoke(
                [
                    SystemMessage(content=RESOLVE_GEO_PROMPT),
                    SystemMessage(content=f"Here is the location to resolve: {clean_input}"),
                    *state["messages"],
                    HumanMessage(
                        content="Please resolve the location information using the return_geo_resolution tool."
                    ),
                ]
            )

            state["messages"].append(response)
            tool_call = [tc for tc in response.tool_calls if tc["name"] == "return_geo_resolution"]

            if tool_call:
                args = tool_call[0]["args"]
                state["resolved_country_code"] = args.get("country_code")
                state["resolved_city"] = args.get("city")

        except Exception as e:
            logger.error(f"Error in geo resolution: {str(e)}")
            state["error"] = str(e)

        return state

    def fetch_locations_from_db(self, state: LocationAgentState) -> LocationAgentState:
        """
        Fetch matching locations from the database
        """
        # The agent couldn't determine the country code, so we use the remote location
        if state.get("resolved_country_code") == REMOTE_COUNTRY_CODE:
            state["location_result"] = LocationResult(
                id=REMOTE_LOCATION_ID,
                country_code=REMOTE_COUNTRY_CODE,
                country="Remote",
                city="Other",
                is_country_only=True,
            )
            return state

        try:
            # here, we'll fetch locations for the resolved country code
            db_locations = get_locations_by_country_code(state["resolved_country_code"], db)
            state["db_locations"] = [
                LocationResult(
                    id=location.id,
                    city=location.city,
                    country=location.country,
                    country_code=location.country_code,
                    is_country_only=location.is_country_only,
                )
                for location in db_locations
            ]
        except Exception as e:
            logger.error(f"Error fetching locations: {str(e)}")
            state["error"] = str(e)
            state["db_locations"] = []

        return state

    @retry(
        wait=wait_random_exponential(min=5, max=60, exp_base=1),
        stop=stop_after_attempt(3),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def resolve_location_with_retry(self, state: LocationAgentState) -> LocationAgentState:
        """
        Resolve location with retry mechanism
        """
        # Pre-LLM step: Manual matching
        if state.get("resolved_city"):
            for loc in state.get("db_locations", []):
                if (
                    loc.city
                    and loc.city.lower() == state["resolved_city"].lower()
                    and loc.country_code == state["resolved_country_code"]
                ):
                    state["location_result"] = loc
                    return state

        # Format database locations for the prompt
        db_locations_json = [
            {
                "id": loc.id,
                "country_code": loc.country_code,
                "country": loc.country,
                "city": loc.city,
                "is_country_only": loc.is_country_only,
            }
            for loc in state.get("db_locations", [])
        ]

        # Prepare location details
        location_input = state["input"]
        location_details = ""
        if location_input.type == LocationType.COMPANY:
            location_details = f'Company Headquarters: "{location_input.headquarters}"\nCountry Codes: "{location_input.country_codes}"'
        elif location_input.type == LocationType.ROLE:
            location_details = f'Role Location: "{location_input.location}"'
        elif location_input.type == LocationType.ALUMNI:
            location_details = f'Alumni City: "{location_input.city}"\nAlumni Country: "{location_input.country}"\nAlumni Country Code: "{location_input.country_code}"'

        try:
            response = await llm_with_tools.ainvoke(
                [
                    SystemMessage(content=RESOLVE_LOCATION_PROMPT),
                    SystemMessage(content=f"Input Location Details:\n{location_details}"),
                    SystemMessage(
                        content=f"Database Locations, for the resolved country code:\n{json.dumps(db_locations_json)}"
                    ),
                    HumanMessage(
                        content="Please resolve the location using the return_location_resolution tool."
                    ),
                ]
            )

            state["messages"].append(response)
            tool_call = [
                tc for tc in response.tool_calls if tc["name"] == "return_location_resolution"
            ]

            if tool_call:
                location_result = tool_call[0]["args"]
                state["location_result"] = LocationResult(**location_result)

        except Exception as e:
            if isinstance(e, openai.RateLimitError) or "429" in str(e):
                raise e
            logger.error(f"Error in location resolution: {str(e)}")
            state["error"] = str(e)

        return state

    async def resolve_location(self, state: LocationAgentState) -> LocationAgentState:
        """
        Resolve the location using the LLM
        """

        # Early return if the location result is already set
        if state.get("location_result"):
            return state

        return await self.resolve_location_with_retry(state)

    async def update_locations(self, states: List[LocationAgentState]) -> List[LocationAgentState]:
        """
        Update locations in batch
        """
        for state in states:
            if not state.get("location_result"):
                continue

            location_result = state["location_result"]

            # Create new location if needed
            if not location_result.id:
                location = Location(
                    city=location_result.city,
                    country=location_result.country,
                    country_code=location_result.country_code,
                    is_country_only=location_result.is_country_only,
                )
                location = create_location(location, db)
                location_result.id = location.id

                # Trigger coordinates update as a background task
                asyncio.create_task(coordinates_service.update_location_coordinates(location))

            # Update the domain with the location
            try:
                if state["input"].type == LocationType.COMPANY:
                    company = get_company_by_id(state["input"].company_id, db)
                    company.hq_location_id = location_result.id
                    update_company(company, db)
                elif state["input"].type == LocationType.ROLE:
                    role = get_role_by_id(state["input"].role_id, db)
                    role.location_id = location_result.id
                    update_role(role, db)
                elif state["input"].type == LocationType.ALUMNI:
                    alumni = find_by_id(state["input"].alumni_id, db)
                    alumni.current_location_id = location_result.id
                    update_alumni(alumni, db)

                # Cache the result
                self._set_in_cache(state["input"], location_result)

            except Exception as e:
                logger.error(f"Error updating domain with location: {str(e)}")
                state["error"] = str(e)

        return states

    async def process_locations(self, locations: List[LocationInput]):
        """
        Process multiple locations in batch
        """
        states = [
            LocationAgentState(
                input=location,
                messages=[],
                db_locations=[],
                processing_time=time.time(),
                model_used=settings.OPENAI_DEFAULT_MODEL,
                error=None,
            )
            for location in locations
        ]

        # Process in smaller chunks to avoid overwhelming the API
        chunk_size = 3
        results = []

        for i in range(0, len(states), chunk_size):
            chunk = states[i : i + chunk_size]

            # Process each state through the graph
            graph = self.create_graph()
            for state in chunk:
                events = graph.stream(state, stream_mode="values")
                # Consume all events
                [event for event in events]
                results.append(state)

            if i + chunk_size < len(states):
                await asyncio.sleep(5)  # Rate limiting pause between chunks

        return results

    async def process_location(self, location_input: LocationInput):
        """
        Process a single location (backward compatibility)
        """
        results = await self.process_locations([location_input])
        return results[0] if results else None


location_agent = LocationAgent()
