import asyncio
import json
import logging
import time
import uuid
from typing import Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables.config import RunnableConfig
from langchain_core.tools import Tool
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.core.config import settings
from app.db import get_db
from app.db.models import Alumni
from app.schemas.job_classification import (
    AlumniJobClassificationParams,
    JobClassificationAgentState,
    JobClassificationRoleInput,
)
from app.utils.agents.esco_reference import (
    get_detailed_esco_classification,
    search_esco_classifications,
)
from app.utils.alumni_db import find_all, find_by_ids
from app.utils.esco_db import update_role_with_classifications
from app.utils.prompts import (
    VALIDATE_ESCO_CORE_PROMPT,
    VALIDATE_ESCO_EXTRA_DETAILS,
)
from app.utils.role_db import get_extended_roles_by_alumni_id

logger = logging.getLogger(__name__)
config = RunnableConfig(recursion_limit=5)

# Get a database session for the service
db = next(get_db())


json_schema = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "confidence": {"type": "number"},
                },
                "required": ["id", "title", "confidence"],
            },
            "minItems": 3,
            "maxItems": 3,
        }
    },
    "required": ["results"],
}


def return_esco_choices(results: dict) -> dict:
    return results


validate_tool = Tool.from_function(
    func=return_esco_choices,
    name="return_esco_choices",
    description="Return exactly 3 ESCO matches with id, title, and confidence",
    args_schema=json_schema,
)
get_detailed_esco_classification = Tool.from_function(
    func=get_detailed_esco_classification,
    name="get_detailed_esco_classification",
    description="Get the detailed ESCO classification for the given id",
)

tools = [get_detailed_esco_classification, validate_tool]

cold_llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
    temperature=0.0,
)
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(
    tools=tools,
)


def get_esco_prompt(retry_count: int = 0) -> str:
    if retry_count > 0:
        return VALIDATE_ESCO_CORE_PROMPT + "\n\n" + VALIDATE_ESCO_EXTRA_DETAILS
    return VALIDATE_ESCO_CORE_PROMPT


class JobClassificationService:
    def __init__(self):
        # Simple in-memory cache for ESCO classifications
        self._esco_cache: Dict[str, List] = {}
        self.MAX_RETRIES = 1

    def create_graph(self) -> StateGraph:
        graph = StateGraph(JobClassificationAgentState)

        # *** Nodes ***
        graph.add_node("get_best_esco_matches_db", self.get_best_esco_matches_db)
        graph.add_node("validate_esco_results", self.validate_esco_results)
        graph.add_node("validate_esco_results_tool_calls", tool_node)
        graph.add_node("insert_classification_into_db", self.insert_classification_into_db)

        # *** Edges ***
        graph.add_edge(START, "get_best_esco_matches_db")
        graph.add_edge("get_best_esco_matches_db", "validate_esco_results")
        graph.add_edge("validate_esco_results_tool_calls", "validate_esco_results")
        graph.add_edge("validate_esco_results", "insert_classification_into_db")

        # If tools are needed during validation, go to tool node
        graph.add_conditional_edges(
            "validate_esco_results",
            tools_condition,
            {
                "tools": "validate_esco_results_tool_calls",
                END: "insert_classification_into_db",
            },
        )

        graph.add_edge("insert_classification_into_db", END)

        compiled_graph = graph.compile()
        # compiled_graph.get_graph().draw_mermaid_png(output_file_path="job_classification_graph.png")
        return compiled_graph

    def get_best_esco_matches_db(
        self,
        state: JobClassificationAgentState,
    ) -> JobClassificationAgentState:
        """
        Get the best (top k) embeddings for this role, using the embeddings of the job title and
        description.
        """
        # For the deterministic embeddings, we'll just use the title and description
        # The remaining fields of role are used as context for the agent in the next node(s)
        query = state["role"].title
        if state["role"].description:
            query += f" {state['role'].description}"

        # Check cache first to avoid redundant embedding searches
        if query in self._esco_cache:
            state["esco_results_from_embeddings"] = self._esco_cache[query]
            return state

        start_time = time.time()
        try:
            esco_results = search_esco_classifications(query)
            # Always initialize the results list, even if empty
            state["esco_results_from_embeddings"] = esco_results
            if len(esco_results) > 0:
                # Only cache non-empty results
                self._esco_cache[query] = esco_results
            else:
                logger.warning(f"No ESCO matches found for query: {query}")
        except Exception as e:
            logger.error(f"Error searching ESCO classifications: {str(e)}")
            state["esco_results_from_embeddings"] = []
            state["error"] = f"Failed to search ESCO classifications: {str(e)}"

        state["processing_time"] = time.time() - start_time
        return state

    def validate_esco_results(self, state: JobClassificationAgentState):
        """
        Validate the ESCO results with the help of the Agent
        """
        retry_count = state.get("retry_count", 0)
        esco_prompt = get_esco_prompt(retry_count)

        try:
            response = llm_with_tools.invoke(
                [
                    SystemMessage(content=esco_prompt),
                    SystemMessage(
                        content=f"Here are the list of results from the vector search: {state['esco_results_from_embeddings']}"
                    ),
                    SystemMessage(content=f"Here is the role to classify: {state['role']}"),
                    *state["messages"],
                    HumanMessage(
                        content="""Please validate the results and provide the 3 best matches using the return_esco_choices tool.
                        Only include: id, title, confidence.
                        DO NOT use the ESCO code as the ID.
                        DO NOT include any comments, extra fields, or explanation."""
                    ),
                ]
            )
            state["messages"].append(response)

            logger.info(f"Response: {response}")
            tool_call = [tc for tc in response.tool_calls if tc.name == "return_esco_choices"]
            if tool_call:
                state["parsed_esco_results"] = tool_call[0].args["results"]

            # Save reasoning if it exists (may be blank)
            state["esco_reasoning"] = response.content or "No explanation provided."

        except Exception as e:
            logger.error(f"LLM validation failed: {e}")
            state["error"] = str(e)

        return state

    def insert_classification_into_db(self, state: JobClassificationAgentState):
        """
        Insert the classification into the database
        """
        update_role_with_classifications(db, state)
        return state

    # This is the actual "Agent" code
    async def _process_role(self, role: JobClassificationRoleInput):
        """
        Async function that processes a single role and finds its ESCO classification
        """
        # Initialize the state with all required fields
        state = JobClassificationAgentState(
            role=role,
            messages=[],
            esco_results_from_embeddings=[],
            esco_results_from_agent=[],
            parsed_esco_results=[],
            processing_time=0.0,
            model_used="granite3.2:8b",
            retry_count=0,
            error=None,
            reasoning=None,
        )

        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values", config=config)

        # Consume all events from the stream
        [event for event in events]

    async def classify_roles_for_alumni(self, alumni_id: str):
        """
        Classify all the roles of an alumni into the ESCO taxonomy.
        This is a background task that processes roles asynchronously.

        Args:
            alumni_id: the ID of the alumni
        """
        try:
            # Get the roles of the alumni
            input_data = get_extended_roles_by_alumni_id(alumni_id, db)

            if not input_data.roles:
                return

            # Process all roles concurrently with parallelism limit to avoid overwhelming resources
            tasks = [self._process_role(role) for role in input_data.roles]

            # Process in smaller chunks if there are many roles
            max_concurrent = 5  # Process up to 5 roles concurrently
            for i in range(0, len(tasks), max_concurrent):
                batch = tasks[i : i + max_concurrent]
                await asyncio.gather(*batch)

        except Exception as e:
            logger.error(f"Error classifying roles for alumni {alumni_id}: {str(e)}")
            # We don't raise the exception since this is a background task

    async def request_alumni_classification(self, params: AlumniJobClassificationParams):
        """
        Request the classification of the roles of the alumni
        """
        alumni_ids = params.alumni_ids
        alumni: list[Alumni] = []

        if alumni_ids:
            alumni_ids = alumni_ids.split(",")
            alumni = find_by_ids(alumni_ids, db)
        else:
            alumni = find_all(db)

        # just making sure the user was not dumb and provided duplicate alumni IDs
        # and newsflash, that user is me :))
        alumni = list(set(alumni))

        logger.info(f"Going to update {len(alumni)} alumni")

        # Process in larger batches to improve throughput
        batch_size = 30
        for i in range(0, len(alumni), batch_size):
            batch = alumni[i : i + batch_size]
            logger.info(
                f"Processing batch {i // batch_size + 1} of {(len(alumni) + batch_size - 1) // batch_size} ({len(batch)} alumni)"
            )

            tasks = []
            for alumni_obj in batch:
                task = asyncio.create_task(self.classify_roles_for_alumni(alumni_obj.id))
                tasks.append(task)

            # Wait for all tasks in this batch to complete
            await asyncio.gather(*tasks)

            # Small delay between batches to prevent rate limiting
            if i + batch_size < len(alumni):
                await asyncio.sleep(0.5)


job_classification_service = JobClassificationService()
