import json
import logging

import openai
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from tenacity import (
    before_sleep_log,
    retry,
    stop_after_attempt,
    wait_random_exponential,
)

from app.core.config import settings
from app.db import get_db
from app.db.models import SeniorityLevel
from app.schemas.seniority import BatchSeniorityInput, SeniorityAgentState
from app.utils.prompts import (
    SENIORITY_CLASSIFICATION_PROMPT,
    SENIORITY_CLASSIFICATION_PROMPT_EXTRA_DETAILS,
)
from app.utils.role_db import get_role_by_id, update_role

# Configure logging
logger = logging.getLogger(__name__)

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
                    "role_id": {"type": "string"},
                    "seniority": {
                        "type": "string",
                        "enum": list(SeniorityLevel.__members__.keys()),
                    },
                    "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                    "reasoning": {"type": "string"},
                },
                "required": [
                    "role_id",
                    "seniority",
                    "reasoning",
                    "confidence",
                ],
            },
        },
    },
    "required": ["results"],
}


def return_seniority_choices(results: dict) -> dict:
    return results


validate_tool = Tool.from_function(
    func=return_seniority_choices,
    name="return_seniority_choices",
    description="For each role, return the seniority level that best describes the role",
    args_schema=json_schema,
)

tools = [validate_tool]


cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    max_retries=3,
    temperature=0.0,
)
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(tools=tools)


def get_seniority_prompt(retry_count: int = 0) -> str:
    if retry_count > 0:
        return (
            SENIORITY_CLASSIFICATION_PROMPT + "\n\n" + SENIORITY_CLASSIFICATION_PROMPT_EXTRA_DETAILS
        )
    return SENIORITY_CLASSIFICATION_PROMPT


class SeniorityAgent:
    def __init__(self):
        self.MAX_RETRIES = 3

    def create_graph(self) -> StateGraph:
        graph = StateGraph(SeniorityAgentState)

        # *** Nodes ***
        graph.add_node("classify_seniority", self.classify_seniority)
        graph.add_node("update_roles_with_seniority", self.update_roles_with_seniority)

        # *** Edges ***
        graph.add_edge(START, "classify_seniority")
        graph.add_edge("classify_seniority", "update_roles_with_seniority")
        graph.add_edge("update_roles_with_seniority", END)

        return graph.compile()

    @retry(
        wait=wait_random_exponential(min=5, max=60, exp_base=1),
        stop=stop_after_attempt(3),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    def classify_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        retry_count = state.get("retry_count", 0)
        batch = state["batch"]

        prompt = SENIORITY_CLASSIFICATION_PROMPT
        roles_context = "\n".join(
            f"- {r.title} at {r.company} ({r.start_date} to {r.end_date or 'Present'})"
            for r in batch.roles
        )
        career_context = f"Total Experience: {batch.total_experience}\n{roles_context}"
        role_ids_str = ", ".join(f'"{r.role_id}"' for r in batch.roles)

        try:
            response = llm_with_tools.invoke(
                [
                    SystemMessage(content=prompt),
                    SystemMessage(content=career_context),
                    HumanMessage(
                        content=f"""
                Classify seniority levels for roles [{role_ids_str}] based on the following schema. Return valid JSON only.

                Schema:
                {json.dumps(json_schema, indent=2)}
                """
                    ),
                ]
            )

            state["messages"].append(response)
            tool_call = [
                tc for tc in response.tool_calls if tc["name"] == "return_seniority_choices"
            ]
            if tool_call:
                args = tool_call[0]["args"]
                state["parsed_seniority_results"] = args["results"]
                return state

        except Exception as e:
            if isinstance(e, openai.RateLimitError) or "429" in str(e):
                state["retry_count"] = retry_count + 1
                raise e

            logger.error(f"LLM validation failed for batch {state['batch']}: {e}")
            state["error"] = str(e)
            raise e

    def update_roles_with_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        for entry in state["parsed_seniority_results"]:
            role_id = entry["role_id"]
            try:
                role = get_role_by_id(role_id, db)
                if not role:
                    logger.warning(f"Role not found: {role_id}")
                    continue

                new_seniority = SeniorityLevel[entry["seniority"]]
                role.seniority_level = new_seniority
                metadata = role.metadata_ or {}
                metadata["seniority_classification"] = {
                    "seniority": new_seniority.value,
                    "confidence": entry["confidence"],
                    "reasoning": entry["reasoning"],
                    "model": state["model_used"],
                }
                role.updated_by = "seniority-agent"
                role.metadata_ = metadata
                update_role(role, db)
            except Exception as e:
                logger.error(f"Failed to update role {role_id}: {e}", exc_info=True)
                continue
        return state

    async def process_role_batch(self, input: BatchSeniorityInput) -> None:
        state = SeniorityAgentState(
            batch=input,
            messages=[],
            seniority_results_from_agent=None,
            parsed_seniority_results=[],
            processing_time=0.0,
            model_used=settings.OPENAI_DEFAULT_MODEL,
            retry_count=0,
            error=None,
        )
        graph = self.create_graph()
        [event for event in graph.stream(state, stream_mode="values")]


seniority_agent = SeniorityAgent()
