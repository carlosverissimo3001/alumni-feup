import asyncio
import json
import logging
from json.decoder import JSONDecodeError
from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.core.config import settings
from app.db import get_db
from app.db.models import Location
from app.schemas.location import LocationAgentState, LocationInput, LocationResult, LocationType
from app.services.location import location_service
from app.utils.alumni_db import find_by_id, update_alumni
from app.utils.company_db import get_company_by_id, update_company
from app.utils.consts import RESOLVE_LOCATION_PROMPT, get_resolve_country_code_prompt
from app.utils.location_db import create_location, get_locations_by_country_code
from app.utils.role_db import get_role_by_id, update_role

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

# Initializes the LLMs
cold_llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
    temperature=0.0,
)

hot_llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
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
        graph.add_node("resolve_country_code", self.resolve_country_code)
        graph.add_node("fetch_locations_from_db", self.fetch_locations_from_db)
        graph.add_node("resolve_location", self.resolve_location)
        graph.add_node("insert_location_into_db", self.insert_location_into_db)
        graph.add_node("update_domain_with_location", self.update_domain_with_location)

        # *** Edges ***
        graph.add_edge(START, "resolve_country_code")

        # Conditional branching after code resolver
        def check_country_code(state: dict) -> Literal["fetch_locations_from_db", "__end__"]:
            return "fetch_locations_from_db" if state.get("resolved_country_code") else END

        graph.add_conditional_edges("resolve_country_code", check_country_code)

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
        compiled_graph.get_graph().draw_mermaid_png(output_file_path="location_resolver_graph.png")
        return compiled_graph

    def is_new_location(self, state: LocationAgentState) -> bool:
        """
        Check if the location is new
        """
        # If we have a location id, it's not new
        if state.get("location_result") and state["location_result"].id:
            logger.info(f"Location has ID, not creating new: {state['location_result'].id}")
            return False

        # Extra check: see if we have an exact match in our DB
        if state.get("location_result") and state.get("db_locations"):
            city = state["location_result"].city
            country_code = state["location_result"].country_code

            if city:
                for loc in state["db_locations"]:
                    if (
                        loc.city
                        and loc.city.lower() == city.lower()
                        and loc.country_code == country_code
                    ):
                        # We found a match in our DB, update the ID
                        logger.info(
                            f"Found exact match in DB, using ID: {loc.id} instead of creating new"
                        )
                        state["location_result"].id = loc.id
                        return False

        # If we don't have a location id, it's new
        return True

    def resolve_country_code(self, state: LocationAgentState) -> LocationAgentState:
        """
        Resolve the country code for the location
        """
        response = cold_llm.invoke(
            [
                SystemMessage(content=get_resolve_country_code_prompt(state["input"].type)),
                SystemMessage(content=f"Here is the location to resolve: {state['input']}"),
                *state["messages"],
                HumanMessage(
                    content="""Please resolve the country code for the location above.
                    Remember: please only answer with the ISO 3166-1 alpha-2 country code (or 'NULL' if undetermined).
                    Do not include any explanations, quotes, or additional text.
                    """  # noqa: E501
                ),
            ]
        )

        country_code = response.content.strip()

        # Store the resolved country code in the state
        state["resolved_country_code"] = country_code if country_code != "NULL" else None
        state["messages"].append(response)

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

        # Prepare detailed information about the input location
        location_input = state["input"]
        location_details = ""
        extracted_city = None

        if location_input.type == LocationType.COMPANY:
            location_details = f'Company Headquarters: "{location_input.headquarters}"\nCountry Codes: "{location_input.country_codes}"'  # noqa: E501
            # Extract city from headquarters (simple extraction)
            if "," in location_input.headquarters:
                extracted_city = location_input.headquarters.split(",")[0].strip()
        elif location_input.type == LocationType.ROLE:
            location_details = f'Role Location: "{location_input.location}"'
            # Role location parsing is complex, let the LLM handle it
        elif location_input.type == LocationType.ALUMNI:
            location_details = f'Alumni City: "{location_input.city}"\nAlumni Country: "{location_input.country}"\nAlumni Country Code: "{location_input.country_code}"'  # noqa: E501
            extracted_city = location_input.city

        # Check for exact matches before calling the LLM
        exact_match = None
        exact_match_info = ""
        if extracted_city:
            for loc in state.get("db_locations", []):
                if loc.city and loc.city.lower() == extracted_city.lower():
                    exact_match = loc
                    logger.info(
                        f"Found exact match for city: {extracted_city} -> {loc.city} (ID: {loc.id})"
                    )
                    exact_match_info = f"""
                    IMPORTANT EXACT MATCH FOUND:
                    I found an exact match for "{extracted_city}" in the database:
                    - ID: {loc.id}
                    - City: {loc.city}
                    - Country: {loc.country}
                    - Country Code: {loc.country_code}

                    YOU MUST USE THIS EXISTING LOCATION INSTEAD OF CREATING A NEW ONE, IF IT MAKES SENSE TO DO SO.
                    """  # noqa: E501
                    break

        response = cold_llm.invoke(
            [
                SystemMessage(content=RESOLVE_LOCATION_PROMPT),
                SystemMessage(
                    content=f"Resolved Country Code: {state.get('resolved_country_code')}"
                ),
                SystemMessage(content=f"Input Location Details:\n{location_details}"),
                SystemMessage(content=f"Database Locations:\n{db_locations_str}"),
                SystemMessage(content=exact_match_info)
                if exact_match_info
                else SystemMessage(content="No exact match was found in the database."),
                HumanMessage(
                    content="Parse the input location and either match it to a database location or create a new location. If an exact match was provided above, you MUST use that location. Return ONLY the JSON object as specified in the instructions."  # noqa: E501
                ),
            ]
        )

        # Parse the response to get the location result
        try:
            # Clean the response content to extract just the JSON part
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            location_result = json.loads(content)

            # Override with exact match if we found one but LLM didn't use it
            if exact_match and (not location_result.get("id") or location_result.get("id") is None):
                logger.info(
                    f"LLM didn't use exact match for {extracted_city}, overriding with ID: {exact_match.id}"  # noqa: E501
                )
                location_result = {
                    "id": str(exact_match.id),
                    "country_code": exact_match.country_code,
                    "country": exact_match.country,
                    "city": exact_match.city,
                    "is_country_only": exact_match.is_country_only,
                }

            # Create LocationResult object
            state["location_result"] = LocationResult(
                id=location_result.get("id"),
                country_code=location_result.get("country_code"),
                country=location_result.get("country"),
                city=location_result.get("city"),
                is_country_only=location_result.get("is_country_only"),
            )

        except (JSONDecodeError, KeyError, AttributeError) as e:
            logger.error(f"Error parsing location result: {e}")
            # Fall back to a minimal location with just the country code
            state["location_result"] = LocationResult(
                id=None,
                country_code=state.get("resolved_country_code"),
                country="Unknown",
                city=None,
            )

        return state

    def insert_location_into_db(self, state: LocationAgentState) -> LocationAgentState:
        """
        Insert the location into the database;
        Triggers a background task to extract the coordinates
        """
        is_country_only = state["location_result"].city is None

        # Create the location object
        location = Location(
            city=state["location_result"].city,
            country=state["location_result"].country,
            country_code=state["location_result"].country_code,
            is_country_only=is_country_only,
        )

        # Insert the location into the database
        location = create_location(location, db)

        # Update the state with the location id
        state["location_result"].id = location.id

        # Offload the coordinates extraction to a background task
        asyncio.create_task(location_service.update_location_coordinates(location))

        return state

    def update_domain_with_location(self, state: LocationAgentState) -> LocationAgentState:
        """
        Update the location for a specific domain - e.g. company, role, alumni
        """
        # Here, we know that the location is already in the database, so we have an ID
        # We just need to update the domain with the location id
        return state

        if state["input"].type == LocationType.COMPANY:
            company = get_company_by_id(state["input"].company_id, db)
            company.hq_location_id = state["location_result"].id
            update_company(company, db)
        elif state["input"].type == LocationType.ROLE:
            role = get_role_by_id(state["input"].role_id, db)
            role.location_id = state["location_result"].id
            update_role(role, db)
        elif state["input"].type == LocationType.ALUMNI:
            alumni = find_by_id(state["input"].alumni_id, db)
            alumni.current_location_id = state["location_result"].id
            update_alumni(alumni, db)

        return state

    # This is the actual "Agent" code
    async def _process_location(self, location_input: LocationInput):
        """
        Async function that processes a single location and finds its ESCO classification
        """
        # Initialize the state with all required fields
        state = LocationAgentState(
            input=location_input,
            messages=[],
            db_locations=[],
            processing_time=0.0,
            model_used="mistral:7b",
        )

        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values")

        # Consume all events from the stream
        # This ensures the graph execution completes
        [event for event in events]

    async def parse_location(self, location_input: LocationInput):
        """
        Parse a free-form location into a structured location objetc.

        Args:
            location_input: the location to parse
        """
        try:
            await asyncio.gather(self._process_location(location_input))

        except Exception as e:
            logger.error(f"Error parsing location {location_input}: {str(e)}")


location_agent = LocationAgent()
