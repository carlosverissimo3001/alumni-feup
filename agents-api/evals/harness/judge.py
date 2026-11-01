"""LLM validation step, isolated from the production agent.

Deliberately does not import app.agents.job_classification: that module's
_process_roles_batch writes classifications to the role/job_classification
tables and schedules a seniority task as a side effect of being invoked, and
nothing here should go anywhere near that path. This re-declares the same
prompt/tool contract (from app.utils.prompts, which is pure data) against a
throwaway ChatOpenAI client instead, so a harness run can never reach the
production write path even by accident.
"""

from __future__ import annotations

import time
from typing import List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.utils.prompts import VALIDATE_ESCO_CORE_PROMPT
from evals.harness.costs import JUDGE_MODEL, count_tokens, estimate_cost_usd
from evals.harness.models import EscoCandidate, JudgeVerdict, RoleFixture

_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "reasoning": {"type": "string"},
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


def _return_esco_choices(results: dict) -> dict:
    return results


def _build_llm():
    tool = Tool.from_function(
        func=_return_esco_choices,
        name="return_esco_choices",
        description="Return exactly 3 ESCO matches with id, title, and confidence",
        args_schema=_JSON_SCHEMA,
    )
    llm = ChatOpenAI(
        model=settings.OPENAI_DEFAULT_MODEL,
        api_key=settings.OPENAI_API_KEY,
        max_retries=3,
        temperature=0.0,
    )
    return llm.bind_tools([tool])


def judge_role(
    fixture: RoleFixture,
    candidates: List[EscoCandidate],
    *,
    live: bool,
) -> JudgeVerdict:
    candidates_had_acceptable = any(c.code in fixture.acceptable_esco_codes for c in candidates)

    if not live:
        raise RuntimeError(
            "judge_role() calls the LLM and --live was not passed. Judgment-only mode "
            "has no cache (re-running it is the point when testing a prompt change), so "
            "it is gated on --live alone rather than a cache miss."
        )

    role_desc = f"{fixture.title} at {fixture.company_name} ({fixture.industry_name})"
    messages = [
        SystemMessage(content=VALIDATE_ESCO_CORE_PROMPT),
        SystemMessage(content=f"Here are the list of results from the vector search: {candidates}"),
        SystemMessage(content=f"Here is the role to classify: {role_desc}"),
        HumanMessage(
            content=(
                "Please validate the results and provide the 3 best matches using the "
                "return_esco_choices tool.\n"
                "Only include: id, title, confidence.\n"
                "DO NOT use the ESCO code as the ID.\n"
                "DO NOT include any comments, extra fields, or explanation."
            )
        ),
    ]

    llm = _build_llm()
    start = time.monotonic()
    try:
        response = llm.invoke(messages)
    except Exception as e:  # noqa: BLE001 - surfaced as an eval result, not raised
        return JudgeVerdict(
            role_id=fixture.id,
            top_choice_title=None,
            top_choice_confidence=None,
            candidates_had_acceptable=candidates_had_acceptable,
            valid_output=False,
            error=str(e),
            latency_s=time.monotonic() - start,
        )
    latency_s = time.monotonic() - start

    tool_calls = [tc for tc in response.tool_calls if tc["name"] == "return_esco_choices"]
    input_tokens = count_tokens("".join(m.content for m in messages))
    output_tokens = count_tokens(str(response.content) + str(response.tool_calls))
    cost_usd = estimate_cost_usd(JUDGE_MODEL, input_tokens, output_tokens)

    if not tool_calls:
        return JudgeVerdict(
            role_id=fixture.id,
            top_choice_title=None,
            top_choice_confidence=None,
            candidates_had_acceptable=candidates_had_acceptable,
            valid_output=False,
            error="model did not call return_esco_choices",
            latency_s=latency_s,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
        )

    args = tool_calls[0]["args"]
    results = args.get("results", [])
    top = results[0] if results else {}
    candidates_by_id = {c.id: c for c in candidates}
    top_code = candidates_by_id[top["id"]].code if top.get("id") in candidates_by_id else None

    return JudgeVerdict(
        role_id=fixture.id,
        top_choice_title=top.get("title"),
        top_choice_confidence=top.get("confidence"),
        top_choice_code=top_code,
        results=results,
        reasoning=args.get("reasoning"),
        candidates_had_acceptable=candidates_had_acceptable,
        valid_output=len(results) == 3,
        latency_s=latency_s,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost_usd,
    )
