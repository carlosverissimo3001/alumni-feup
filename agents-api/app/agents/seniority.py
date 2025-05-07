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
from app.schemas.seniority import SeniorityAgentState, SeniorityInput, RoleSeniorityInput
from app.services.seniority import SeniorityService
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

# This agent doesn't need any tools, for now
tools = []
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(
    tools=tools,
)


class SeniorityAgent:
    def create_graph(self) -> StateGraph:
        graph = StateGraph(SeniorityAgentState)

        # *** Nodes ***
        graph.add_node("compute_seniority", self.compute_seniority)
        graph.add_node("update_role_with_seniority", self.update_role_with_seniority)

        # *** Edges ***
        graph.add_edge(START, "compute_seniority")
        graph.add_edge("compute_seniority", "update_role_with_seniority")
        graph.add_edge("update_role_with_seniority", END)

        return graph

    def compute_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        return NotImplementedError

    def update_role_with_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        return NotImplementedError

    def _process_role_seniority(self, input: SeniorityInput) -> SeniorityInput:
        state = SeniorityAgentState(
            roles=input.roles,
            messages=[],
            processing_time=0.0,
            model_used="mistral:7b",
        )
        
        graph = self.create_graph()
        events = graph.stream(state, stream_mode="values")

        # Consume all events from the stream
        # This ensures the graph execution completes
        [event for event in events]
        
seniority_agent = SeniorityAgent()
        
        
