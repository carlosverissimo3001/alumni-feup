import asyncio
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.core.config import settings
from app.db import get_db
from app.schemas.job_classification import JobClassificationAgentState, JobClassificationRoleInput
from app.utils.agents.esco_reference import (
    get_detailed_esco_classification,
    search_esco_classifications,
)
from app.utils.consts import VALIDATE_ESCO_RESULTS_PROMPT
from app.utils.esco_db import update_role_with_classifications
from app.utils.role_db import get_extended_roles_by_alumni_id

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


tools = [
    get_detailed_esco_classification,
    #get_all_alumni_classifications,
]

cold_llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
    temperature=0.0,
)
llm_with_tools = cold_llm.bind_tools(tools)

hot_llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
    temperature=0.3,
)

tool_node = ToolNode(
    tools=tools,
)


# Create the prompt template for job classification
class JobClassificationService:
    def create_graph(self) -> StateGraph:
        graph = StateGraph(JobClassificationAgentState)

        # *** Nodes ***
        graph.add_node(
            "get_best_esco_matches_db", self.get_best_esco_matches_db
        )
        graph.add_node(
            "validate_esco_results", self.validate_esco_results
        )
        graph.add_node(
            "validate_esco_results_tool_calls", tool_node
        )
        graph.add_node(
            "insert_classification_into_db", self.insert_classification_into_db
        ) 
        
        # *** Edges ***
        graph.add_edge(START, "get_best_esco_matches_db")
        graph.add_edge("get_best_esco_matches_db", "validate_esco_results")
        graph.add_edge("validate_esco_results_tool_calls", "validate_esco_results")
        
        # If tools are needed, we go to the tool node, otherwise we go directly to the next node
        graph.add_conditional_edges(
            "validate_esco_results",
            tools_condition,
            {
                "tools": "validate_esco_results_tool_calls",
                END: "insert_classification_into_db",
            }
        )
        graph.add_edge("insert_classification_into_db", END)

        compiled_graph = graph.compile()
        # compiled_graph.get_graph().draw_mermaid_png(output_file_path="job_classification_graph.png")
        return compiled_graph

    # Note: Maybe this should not be inside the service class
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

        esco_results = search_esco_classifications(query, 5)
        if len(esco_results) > 0:
            state["esco_results_from_embeddings"] = esco_results

        return state

    def validate_esco_results(self, state: JobClassificationAgentState):
        """
        Here we'll validate the ESCO results with the help of the Agent
        """
        response = llm_with_tools.invoke(
            [
                SystemMessage(
                    content=VALIDATE_ESCO_RESULTS_PROMPT
                ),
                SystemMessage(
                    content=f"Here are the list of results from the vector search: {state['esco_results_from_embeddings']}"
                ),
                SystemMessage(
                    content=f"Here is the role to classify: {state['role']}"
                ),
                *state["messages"],
                HumanMessage(
                    content="""Please validate the results, and provide the classification(s) that you think best describes the role.
                    Remember: please only answer with the JSON format provided in the prompt, DO NOT include any other text or comments.
                    """
                )
            ]
        )
        
        # Store the raw response content
        state["esco_results_from_agent"] = response.content
        state["messages"].append(response)
        
        return state

    def insert_classification_into_db(self, state: JobClassificationAgentState):
        """
        Insert the classification into the database
        """
        update_role_with_classifications(db, state, 1)
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
            processing_time=0.0,
            model_used='mistral:7b'
        )
        
        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values")

        # Consume all events from the stream
        # This ensures the graph execution completes
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

            # Process all roles concurrently
            logger.info(f"Started classification process for alumni {alumni_id}")
            await asyncio.gather(*[self._process_role(role) for role in input_data.roles])

        except Exception as e:
            logger.error(f"Error classifying roles for alumni {alumni_id}: {str(e)}")
            # We don't raise the exception since this is a background task


job_classification_service = JobClassificationService()
