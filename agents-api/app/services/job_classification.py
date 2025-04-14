import logging
import asyncio

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import START, END, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict

from app.core.config import settings
from app.db import get_db
from app.utils.role_db import get_extended_roles_by_alumni_id
from app.utils.agents.esco_reference import search_esco_classifications
from app.schemas.job_classification import JobClassificationRoleInput, JobClassificationAgentState

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


tools = [] # [search_esco_classifications]

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

        # TODO: Define nodes, edges, tool_nodes, etc.
        graph.add_node(
            "get_best_esco_matches_using_embeddings", self.get_best_esco_matches_using_embeddings
        )
        graph.add_edge(START, "get_best_esco_matches_using_embeddings")

        ## TODO: We'll ask the agent if it agrees with the results
        ## If you agree with the results, all good
        ## If you don't, or if the confidence is low
        ## Here's a tool that you can use to fetch the full definition of the many ESCO classifications 
        ## by code, you can compare it with the query to see if you agree with any of the matches
        ## If at this point, you still don't agree, we'll just use the top 3 matches, and then the user
        ## will be able to override the results

        graph.add_edge("get_best_esco_matches_using_embeddings", END)
        compiled_graph = graph.compile()
        return compiled_graph

    # Note: Maybe this should not be inside the service class
    def get_best_esco_matches_using_embeddings(
        self,
        state: JobClassificationAgentState,
    ) -> JobClassificationAgentState:
        """
        Get the best (top 10) embeddings for this role, using the embeddings of the job title and
        description.
        """
        # For the deterministic embeddings, we'll just use the title and description
        # The remaining fields of role are used as context for the agent in the next node(s)
        query = state["role"].title
        if state["role"].description:
            query += f" {state["role"].description}"

        esco_results = search_esco_classifications(query, 3)
        if len(esco_results) > 0:
            state["esco_results"] = esco_results

        return state

    async def _process_role(self, role: JobClassificationRoleInput):
        """
        Async function that processes a single role and finds its ESCO classification
        """
        state = JobClassificationAgentState(role=role)
        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values")
        for event in events:
            print(event)


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
            await asyncio.gather(*[self._process_role(role) for role in input_data.roles])
            logger.info(f"Started classification process for alumni {alumni_id}")
            
        except Exception as e:
            logger.error(f"Error classifying roles for alumni {alumni_id}: {str(e)}")
            # We don't raise the exception since this is a background task


job_classification_service = JobClassificationService()
