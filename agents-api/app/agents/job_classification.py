import asyncio
import json
import logging
import time
from typing import List, Optional

import openai
from fastapi.encoders import jsonable_encoder
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from redis import Redis
from tenacity import (
    before_sleep_log,
    retry,
    stop_after_attempt,
    wait_random_exponential,
)

from app.core.config import settings
from app.db.session import session_scope
from app.schemas.job_classification import (
    JobClassificationAgentState,
    JobClassificationRoleInput,
    ValidationOutcome,
)
from app.schemas.seniority import AlumniSeniorityParams
from app.services.seniority import seniority_service
from app.utils.agents.esco_reference import search_esco_classifications
from app.utils.esco_db import (
    update_role_with_classifications_batch,
)
from app.utils.prompts import (
    VALIDATE_ESCO_CORE_PROMPT,
    VALIDATE_ESCO_EXTRA_DETAILS,
)

logger = logging.getLogger(__name__)

# Process-wide cap on in-flight LLM validation calls. Every caller of
# _validate_single acquires this before the actual provider call, so the
# limit holds across the whole service (concurrent alumni, concurrent roles
# within an alumnus, etc.) rather than per invocation.
MAX_CONCURRENT_LLM_CALLS = 25
_llm_call_semaphore = asyncio.Semaphore(MAX_CONCURRENT_LLM_CALLS)

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

DEFAULT_ACTION_BY = "job-classification-agent"

cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    api_key=settings.OPENAI_API_KEY,
    # Retries are owned by the tenacity wrapper around _validate_single, so
    # the SDK doesn't layer its own retry budget on top of that one.
    max_retries=0,
    temperature=0.0,
)
llm_with_tools = cold_llm.bind_tools([validate_tool])


def get_esco_prompt(retry_count: int = 0) -> str:
    if retry_count > 0:
        return VALIDATE_ESCO_CORE_PROMPT + "\n\n" + VALIDATE_ESCO_EXTRA_DETAILS
    return VALIDATE_ESCO_CORE_PROMPT


class JobClassificationAgent:
    def __init__(self):
        self._redis_cache = Redis.from_url(settings.REDIS_URL)
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
                messages = [
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
                async with _llm_call_semaphore:
                    response = await llm_with_tools.ainvoke(messages)
                state["messages"].append(response)

                tool_call = [
                    tc for tc in response.tool_calls if tc["name"] == "return_esco_choices"
                ]
                if tool_call:
                    args = tool_call[0]["args"]
                    state["parsed_esco_results"] = args.get("results", [])
                    state["reasoning"] = args.get("reasoning", "No explanation provided.")
                    state["outcome"] = ValidationOutcome.SUCCESS
                    return state

                # Expected tool call absent from the response: a schema
                # failure, not a transient one, so it's reported explicitly
                # and not retried.
                logger.error(
                    f"LLM response for role {state['role']} did not include a "
                    "return_esco_choices tool call."
                )
                state["parsed_esco_results"] = []
                state["error"] = "LLM response did not include the return_esco_choices tool call"
                state["outcome"] = ValidationOutcome.INVALID_LLM_RESPONSE
                return state

            except Exception as e:
                if isinstance(e, openai.RateLimitError) or "429" in str(e):
                    state["retry_count"] = retry_count + 1
                    raise e

                logger.error(f"LLM validation failed for role {state['role']}: {e}")
                state["error"] = str(e)
                raise e

        # Skip the LLM entirely when retrieval has nothing to validate - it
        # cannot possibly produce a correct answer from an empty candidate set.
        # Calls that do proceed are paced per-alumnus here, on top of the
        # global _llm_call_semaphore cap around the provider call above.
        to_validate: List[tuple[int, JobClassificationAgentState]] = []
        results: List[Optional[JobClassificationAgentState]] = [None] * len(states)
        for idx, state in enumerate(states):
            if state.get("esco_results_from_embeddings"):
                to_validate.append((idx, state))
                continue

            state["parsed_esco_results"] = []
            state["outcome"] = (
                ValidationOutcome.RETRIEVAL_FAILED
                if state.get("error")
                else ValidationOutcome.EMPTY_RETRIEVAL
            )
            results[idx] = state

        # Process in smaller chunks to avoid overwhelming the API
        chunk_size = 3
        for i in range(0, len(to_validate), chunk_size):
            chunk = to_validate[i : i + chunk_size]
            chunk_results = await asyncio.gather(*[_validate_single(s) for _, s in chunk])
            for (idx, _), result in zip(chunk, chunk_results):
                results[idx] = result
            if i + chunk_size < len(to_validate):
                await asyncio.sleep(5)

        return results

    async def batch_update_classifications(self, states: List[JobClassificationAgentState]):
        """Persist classifications. Raises if any role's write fails.

        A swallowed write failure is indistinguishable from success to the
        caller, so failures are raised instead of just logged - the pipeline
        executor relies on that to mark the task FAILED.
        """
        updates = [
            {
                "role_id": state["role"].role_id,
                "classifications": state["parsed_esco_results"],
                "reasoning": state["reasoning"],
            }
            for state in states
            if state["parsed_esco_results"]
        ]

        if not updates:
            return []

        # Loads nothing and writes in one go, so a scope of its own is
        # enough - no instance crosses a session boundary here.
        with session_scope() as db:
            outcomes = await update_role_with_classifications_batch(db, updates, DEFAULT_ACTION_BY)

        failures = [o for o in outcomes if not o.success]
        if failures:
            raise RuntimeError(
                f"Failed to persist classification for {len(failures)} role(s): "
                f"{[(f.role_id, f.error) for f in failures]}"
            )

        return outcomes

    async def _process_roles_batch(
        self,
        roles: List[JobClassificationRoleInput],
        alumni_id: str,
        skip_followup_seniority: bool = False,
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

        # Let the seniority agent handle the rest of the workload.
        # Skipped when the caller already runs seniority classification
        # explicitly right after (e.g. the pipeline's SENIORITY stage) -
        # firing this too would just classify seniority twice.
        if not skip_followup_seniority:
            asyncio.create_task(
                seniority_service.request_alumni_seniority(
                    AlumniSeniorityParams(alumni_ids=alumni_id)
                )
            )

        return states


job_classification_agent = JobClassificationAgent()
