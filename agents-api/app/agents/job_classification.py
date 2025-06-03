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
from app.schemas.job_classification import (
    JobClassificationAgentState,
    JobClassificationRoleInput,
)
from app.schemas.seniority import AlumniSeniorityParams
from app.services.seniority import seniority_service
from app.utils.agents.esco_reference import (
    get_detailed_esco_classification,
    search_esco_classifications,
)
from app.utils.esco_db import (
    update_role_with_classifications_batch,
)
from app.utils.prompts import (
    VALIDATE_ESCO_CORE_PROMPT,
    VALIDATE_ESCO_EXTRA_DETAILS,
)

logger = logging.getLogger(__name__)

# Get a database session for the agent
db = next(get_db())

json_schema = {
    "type": "object",
    "properties": {
        "reasoning": {
            "type": "string",
            "description": "Explain why the selected ESCO result is the best fit for the role.",
        },
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
        },
    },
    "required": ["reasoning", "results"],
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

cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    max_retries=3,
    temperature=0.0,
)
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(tools=tools)


def get_esco_prompt(retry_count: int = 0) -> str:
    if retry_count > 0:
        return VALIDATE_ESCO_CORE_PROMPT + "\n\n" + VALIDATE_ESCO_EXTRA_DETAILS
    return VALIDATE_ESCO_CORE_PROMPT


class JobClassificationAgent:
    def __init__(self):
        self._redis_cache = Redis(host="localhost", port=6379, db=0)
        self.CACHE_TTL = 60 * 60 * 24  # 24 hours
        self.MAX_RETRIES = 3

    def _get_cache_key(self, query: str) -> str:
        return f"esco_classification:{query}"

    def _get_from_cache(self, query: str) -> List | None:
        cached = self._redis_cache.get(self._get_cache_key(query))
        if cached:
            return json.loads(cached)
        return None

    def _set_in_cache(self, query: str, results: List):
        self._redis_cache.setex(
            self._get_cache_key(query), self.CACHE_TTL, json.dumps(jsonable_encoder(results))
        )

    def create_graph(self) -> StateGraph:
        graph = StateGraph(JobClassificationAgentState)
        graph.add_node("get_best_esco_matches_db", self.get_best_esco_matches_db)
        graph.add_node("validate_and_update", self._process_roles_batch)
        graph.add_edge(START, "get_best_esco_matches_db")
        graph.add_edge("get_best_esco_matches_db", "validate_and_update")
        graph.add_edge("validate_and_update", END)
        return graph.compile()

    def get_best_esco_matches_db(
        self, state: JobClassificationAgentState
    ) -> JobClassificationAgentState:
        query = state["role"].title
        if state["role"].description:
            query += f" {state['role'].description}"

        cached_results = self._get_from_cache(query)
        if cached_results:
            state["esco_results_from_embeddings"] = cached_results
            return state

        try:
            esco_results = search_esco_classifications(query)
            state["esco_results_from_embeddings"] = esco_results
            if esco_results:
                self._set_in_cache(query, esco_results)
        except Exception as e:
            logger.error(f"Error searching ESCO classifications: {str(e)}")
            state["esco_results_from_embeddings"] = []
            state["error"] = f"Failed to search ESCO classifications: {str(e)}"

        state["processing_time"] = time.time() - state.get("processing_time", 0.0)
        return state

    async def validate_esco_results_batch(
        self, states: List[JobClassificationAgentState]
    ) -> List[JobClassificationAgentState]:
        @retry(
            wait=wait_random_exponential(min=5, max=60, exp_base=1),
            stop=stop_after_attempt(self.MAX_RETRIES),
            before_sleep=before_sleep_log(logger, logging.WARNING),
        )
        async def _validate_single(state: JobClassificationAgentState):
            retry_count = state.get("retry_count", 0)
            try:
                esco_prompt = get_esco_prompt(retry_count)
                response = await llm_with_tools.ainvoke(
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

                tool_call = [
                    tc for tc in response.tool_calls if tc["name"] == "return_esco_choices"
                ]
                if tool_call:
                    args = tool_call[0]["args"]
                    state["parsed_esco_results"] = args.get("results", [])
                    state["reasoning"] = args.get("reasoning", "No explanation provided.")
                    return state

            except Exception as e:
                if isinstance(e, openai.RateLimitError) or "429" in str(e):
                    state["retry_count"] = retry_count + 1
                    raise e

                logger.error(f"LLM validation failed for role {state['role']}: {e}")
                state["error"] = str(e)
                raise e

        # Process in smaller chunks to avoid overwhelming the API
        chunk_size = 3
        results = []
        for i in range(0, len(states), chunk_size):
            chunk = states[i : i + chunk_size]
            chunk_results = await asyncio.gather(*[_validate_single(state) for state in chunk])
            results.extend(chunk_results)
            if i + chunk_size < len(states):
                await asyncio.sleep(5)

        return results

    async def batch_update_classifications(self, states: List[JobClassificationAgentState]):
        try:
            updates = [
                {
                    "role_id": state["role"].role_id,
                    "classifications": state["parsed_esco_results"],
                    "reasoning": state["reasoning"],
                }
                for state in states
                if state["parsed_esco_results"]
            ]

            if updates:
                await update_role_with_classifications_batch(db, updates)

        except Exception as e:
            logger.error(f"Error in batch update classifications: {str(e)}")

    async def _process_roles_batch(
        self, roles: List[JobClassificationRoleInput], alumni_id: str
    ) -> List[JobClassificationAgentState]:
        states = [
            JobClassificationAgentState(
                role=role,
                messages=[],
                esco_results_from_embeddings=[],
                esco_results_from_agent=[],
                parsed_esco_results=[],
                processing_time=0.0,
                model_used=settings.OPENAI_DEFAULT_MODEL,
                retry_count=0,
                error=None,
                reasoning=None,
            )
            for role in roles
        ]

        states = [self.get_best_esco_matches_db(state) for state in states]
        states = await self.validate_esco_results_batch(states)
        await self.batch_update_classifications(states)

        # Let the seniority agent handle the rest of the workload
        asyncio.create_task(
            seniority_service.request_alumni_seniority(AlumniSeniorityParams(alumni_ids=alumni_id))
        )

        return states


job_classification_agent = JobClassificationAgent()
