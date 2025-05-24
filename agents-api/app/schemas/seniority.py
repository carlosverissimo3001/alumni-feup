from typing import Dict, List, Optional

from fastapi import Query
from langgraph.graph import add_messages
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict

from app.db.models import SeniorityLevel


# Entry point for the seniority agent
# Classifies the seniority of the roles of an alumn
# This is the payload we send on the last edge of the job classification agent
class AlumniSeniorityParams(BaseModel):
    alumni_ids: Optional[str] = Field(
        Query(None, description="Comma-separated list of alumni IDs, whose roles will be updated")
    )  # noqa: E501


class RoleSeniorityInput(BaseModel):
    role_id: str
    title: str  # Adding title for better context
    description: Optional[str] = None
    company: str
    esco_classification: Optional[str] = None
    duration: str
    start_date: str
    end_date: Optional[str] = None
    is_current: bool  # Adding current role flag


class BatchSeniorityInput(BaseModel):
    alumni_id: str
    roles: List[RoleSeniorityInput]
    # Additional career context
    total_experience: str  # e.g., "5 years and 3 months"
    industries: List[str]  # List of unique industries the person has worked in
    companies: List[str]  # List of unique companies


class SeniorityOutput(BaseModel):
    role_id: str
    seniority: SeniorityLevel
    explanation: str
    confidence: float


class BatchSeniorityOutput(BaseModel):
    classifications: List[SeniorityOutput]
    career_summary: str  # Agent's overall assessment of the career progression


class SeniorityAgentState(TypedDict):
    # The batch of roles being processed
    batch: BatchSeniorityInput

    # The agent's classification result
    classification: Optional[str]

    # Track retry attempts
    retry_count: int

    # Store any error messages
    error: Optional[str]

    # For the LangGraph framework
    messages: Annotated[list, add_messages]

    processing_time: float

    model_used: str
