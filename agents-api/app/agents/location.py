import asyncio
import json
import logging
from json.decoder import JSONDecodeError
from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.core.config import settings
from app.db import get_db
from app.db.models import Location
from app.schemas.location import LocationAgentState, LocationInput, LocationResult, LocationType
from app.services.location import location_service
from app.utils.alumni_db import find_by_id, update_alumni
from app.utils.company_db import get_company_by_id, update_company
from app.utils.location_db import create_location, get_locations_by_country_code
from app.utils.prompts import RESOLVE_LOCATION_PROMPT, get_resolve_geo_prompt
from app.utils.role_db import get_role_by_id, update_role

REMOTE_LOCATION_ID = "15045675-0782-458b-9bb7-02567ac246fd"
REMOTE_COUNTRY_CODE = "REMOTE"

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

# Initializes the LLMs
cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.0,
)

hot_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    temperature=0.3,
)

# This agent doesn't need any tools, for now
tools = []
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(
    tools=tools,
)


class LocationAgent:
    def create_graph(self) -> StateGraph:
        graph = StateGraph(LocationAgentState)

        # *** Nodes ***
        graph.add_node("resolve_geo", self.resolve_geo)
        graph.add_node("fetch_locations_from_db", self.fetch_locations_from_db)
        graph.add_node("resolve_location", self.resolve_location)
        graph.add_node("insert_location_into_db", self.insert_location_into_db)
        graph.add_node("update_domain_with_location", self.update_domain_with_location)

        # *** Edges ***
        graph.add_edge(START, "resolve_geo")

        # Conditional branching after code resolver
        def check_geo(
            state: dict,
        ) -> Literal["fetch_locations_from_db", "update_domain_with_location", "__end__"]:
            # Cases:
            # 1. No country code - End
            # 2. Country code is REMOTE - Sets the location result to the remote location and goes to update_domain_with_location
            # 3. Country code is not REMOTE - Go to fetch_locations_from_db
            if not state.get("resolved_country_code"):
                return END
            if state.get("resolved_country_code") == REMOTE_COUNTRY_CODE:
                state["location_result"] = LocationResult(
                    id=REMOTE_LOCATION_ID,
                    country_code=REMOTE_COUNTRY_CODE,
                    # This is hacky, I know :))
                    country="Remote",
                    city="Remote",
                    is_country_only=True,
                )
                return "update_domain_with_location"
            return "fetch_locations_from_db"

        graph.add_conditional_edges("resolve_geo", check_geo)

        graph.add_edge("fetch_locations_from_db", "resolve_location")

        # Conditional branching after location resolver
        def check_location_result(
            state: dict,
        ) -> Literal["update_domain_with_location", "insert_location_into_db"]:
            return (
                "insert_location_into_db"
                if self.is_new_location(state)
                else "update_domain_with_location"
            )

        graph.add_conditional_edges("resolve_location", check_location_result)
        graph.add_edge("insert_location_into_db", "update_domain_with_location")
        graph.add_edge("update_domain_with_location", END)

        # *** Compile the graph ***
        compiled_graph = graph.compile()
        # compiled_graph.get_graph().draw_mermaid_png(output_file_path="location_agent_graph.png")
        return compiled_graph

    def is_new_location(self, state: LocationAgentState) -> bool:
        """
        Return True if location_result has no 'id', meaning it's a new location.
        """
        location = state.get("location_result")
        if not location:
            return False
        return (
            getattr(location, "id", None) is None
            if not isinstance(location, dict)
            else location.get("id") is None
        )

    def resolve_geo(self, state: LocationAgentState) -> LocationAgentState:
        """
        Resolve the country code for the location
        """
        clean_input = ""
        if state["input"].type == LocationType.COMPANY:
            clean_input = f'Company Headquarters: "{state["input"].headquarters}"\nCountry Codes: "{state["input"].country_codes}"'  # noqa: E501
        elif state["input"].type == LocationType.ROLE:
            clean_input = f'Role Location: "{state["input"].location}"'
        elif state["input"].type == LocationType.ALUMNI:
            clean_input = f'Alumni City: "{state["input"].city}"\nAlumni Country: "{state["input"].country}"\nAlumni Country Code: "{state["input"].country_code}"'  # noqa: E501

        response = cold_llm.invoke(
            [
                SystemMessage(content=get_resolve_geo_prompt(state["input"].type)),
                SystemMessage(content=f"Here is the location to resolve: {clean_input}"),
                *state["messages"],
                HumanMessage(
                    content="""Please resolve the location information for the location above.
                    Return ONLY the JSON object as described in the instructions.
                    DO NOT include any explanations, quotes, or additional text.
                    """  # noqa: E501
                ),
            ]
        )

        location_data = response.content.strip().replace("```json", "").replace("```", "").strip()

        location = {}
        try:
            location = json.loads(location_data)
        except JSONDecodeError as e:
            logger.error(f"Error parsing geo response: {str(e)}")
            logger.error(f"Raw response: {location_data}")

        state["messages"].append(response)

        country_code = location.get("country_code")
        city = location.get("city")

        state["resolved_country_code"] = (
            country_code
            if isinstance(country_code, str) and country_code.lower() != "null"
            else None
        )
        state["resolved_city"] = city if isinstance(city, str) and city.lower() != "null" else None

        return state

    def fetch_locations_from_db(self, state: LocationAgentState) -> LocationAgentState:
        """
        Fetch the locations from the database
        """
        db_locations = get_locations_by_country_code(state["resolved_country_code"], db)

        locations = [
            LocationResult(
                id=location.id,
                city=location.city,
                country=location.country,
                country_code=location.country_code,
                is_country_only=location.is_country_only,
            )
            for location in db_locations
        ]

        state["db_locations"] = locations

        return state

    def resolve_location(self, state: LocationAgentState) -> LocationAgentState:
        """
        Using the db locations, decide which one is the best match for the location, or create a new one
        """  # noqa: E501
        # Format database locations for prompt
        db_locations_json = []
        for loc in state.get("db_locations", []):
            db_locations_json.append(
                {
                    "id": loc.id,
                    "country_code": loc.country_code,
                    "country": loc.country,
                    "city": loc.city,
                    "is_country_only": loc.is_country_only,
                }
            )

        db_locations_str = str(db_locations_json) if db_locations_json else "[]"

        # Check for exact matches before calling the LLM
        extracted_city = state.get("resolved_city")
        exact_match = None

        if extracted_city:
            for loc in state.get("db_locations", []):
                if loc.city and loc.city.lower() == extracted_city.lower():
                    exact_match = loc
                    logger.info(
                        f"Found exact match for city: {extracted_city} -> {loc.city} (ID: {loc.id})"
                    )
                    break

        # Set the exact match in the state
        if exact_match and exact_match.country_code == state.get("resolved_country_code"):
            state["location_result"] = LocationResult(
                id=exact_match.id,
                country_code=exact_match.country_code,
                country=exact_match.country,
                city=exact_match.city,
                is_country_only=exact_match.is_country_only,
            )

            # Return early, we don't need to call the LLM
            return state

        # Prepare detailed information about the input location
        location_details = ""
        location_input = state["input"]
        if location_input.type == LocationType.COMPANY:
            location_details = f'Company Headquarters: "{location_input.headquarters}"\nCountry Codes: "{location_input.country_codes}"'  # noqa: E501
        elif location_input.type == LocationType.ROLE:
            location_details = f'Role Location: "{location_input.location}"'
        elif location_input.type == LocationType.ALUMNI:
            location_details = f'Alumni City: "{location_input.city}"\nAlumni Country: "{location_input.country}"\nAlumni Country Code: "{location_input.country_code}"'  # noqa: E501

        # We only call the LLM if we don't have an exact match using the city and country code resolver
        response = cold_llm.invoke(
            [
                SystemMessage(content=RESOLVE_LOCATION_PROMPT),
                SystemMessage(content=f"Input Location Details:\n{location_details}"),
                SystemMessage(content=f"Database Locations:\n{db_locations_str}"),
                HumanMessage(
                    content="""Parse the input location and either match it to a database location or create a new location. 
                    Return ONLY the JSON object as specified in the instructions.
                    DO NOT include any text or comments before or after the JSON object."""  # noqa: E501
                ),
            ]
        )
        location = response.content.strip()

        # Store the raw response content
        try:
            # Log the raw response for debugging
            logger.debug(f"Raw LLM response for location resolution: {location}")

            # Pre-process the JSON string to fix any Python boolean literals
            location = location.replace("True", "true").replace("False", "false")

            parsed_location = json.loads(location)
            state["location_result"] = parsed_location
        except JSONDecodeError as e:
            # Log detailed error information
            logger.error(f"JSONDecodeError parsing location: {str(e)}")
            logger.error(f"Raw location string: {location}")

            state["location_result"] = None

        state["messages"].append(response)

        return state

    def insert_location_into_db(self, state: LocationAgentState) -> LocationAgentState:
        """
        Insert the location into the database;
        Triggers a background task to extract the coordinates
        """
        location_result = state["location_result"]
        logger.info(f"Inserting location into db: {location_result}")

        # Helper to extract fields from dict or object
        get = (
            location_result.get
            if isinstance(location_result, dict)
            else lambda k: getattr(location_result, k, None)
        )

        city = get("city")
        country = get("country")
        country_code = get("country_code")
        is_country_only = city is None

        location = Location(
            city=city,
            country=country,
            country_code=country_code,
            is_country_only=is_country_only,
        )

        # Insert into DB and update ID
        location = create_location(location, db)
        if isinstance(location_result, dict):
            location_result["id"] = location.id
        else:
            location_result.id = location.id

        asyncio.create_task(location_service.update_location_coordinates(location))

        return state

    def update_domain_with_location(self, state: LocationAgentState) -> LocationAgentState:
        """
        Update the location for a specific domain - e.g. company, role, alumni
        """
        # Here, we know that the location is already in the database, so we have an ID
        # We just need to update the domain with the location id
        if not state.get("location_result"):
            return state

        get = (
            state["location_result"].get
            if isinstance(state["location_result"], dict)
            else lambda k: getattr(state["location_result"], k, None)
        )
        location_id = get("id")

        if state["input"].type == LocationType.COMPANY:
            company = get_company_by_id(state["input"].company_id, db)
            company.hq_location_id = location_id
            update_company(company, db)
        elif state["input"].type == LocationType.ROLE:
            role = get_role_by_id(state["input"].role_id, db)
            role.location_id = location_id
            update_role(role, db)
        elif state["input"].type == LocationType.ALUMNI:
            alumni = find_by_id(state["input"].alumni_id, db)
            alumni.current_location_id = location_id
            update_alumni(alumni, db)

        return state

    # This is the actual "Agent" code
    async def process_location(self, location_input: LocationInput):
        """
        Async function that processes a location input into a structured location object
        """
        # Initialize the state with all required fields
        state = LocationAgentState(
            input=location_input,
            messages=[],
            db_locations=[],
            processing_time=0.0,
            model_used=settings.OPENAI_DEFAULT_MODEL,
        )

        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values")

        # Consume all events from the stream
        # This ensures the graph execution completes
        [event for event in events]


location_agent = LocationAgent()
