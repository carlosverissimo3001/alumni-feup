import enum
from datetime import datetime
from typing import List, Optional

from langgraph.graph import add_messages
from pydantic import BaseModel, Field
from typing_extensions import Annotated, TypedDict


class Source(str, enum.Enum):
    """
    How the agent was able to classify the role into an ESCO classification.

    TEXT_EMBEDDINGS: The agent used text embeddings to classify the role into an ESCO classification.
    AGENT_INFERENCE: The agent used inference to classify the role into an ESCO classification.
    """

    TEXT_EMBEDDINGS = "TEXT_EMBEDDINGS"
    AGENT_INFERENCE = "AGENT_INFERENCE"


class JobClassificationRoleInput(BaseModel):
    role_id: str = Field(..., description="The role ID to classify")
    title: str = Field(..., description="The title of the role")
    description: Optional[str] = Field(None, description="The description of the role")
    start_date: datetime = Field(..., description="The start date of the role")
    end_date: Optional[datetime] = Field(None, description="The end date of the role")
    company_name: str = Field(..., description="The name of the company")
    industry_name: str = Field(..., description="The name of the industry")
    is_promotion: bool = Field(..., description="Whether the role is a promotion")


class JobClassificationInput(BaseModel):
    alumni_id: str = Field(..., description="The alumni ID to classify")
    roles: List[JobClassificationRoleInput] = Field(..., description="The roles to classify")


class EscoResult(BaseModel):
    """Schema for ESCO classification result."""

    code: str = Field(..., description="ESCO classification code")
    title: str = Field(..., description="ESCO classification title")
    level: int = Field(..., description="ESCO classification level")
    confidence: float = Field(..., description="Confidence score of the classification")


class JobClassificationAgentState(TypedDict):
    role: JobClassificationRoleInput
    messages: Annotated[list, add_messages]
    esco_results_from_embeddings: List[EscoResult]
    esco_results_from_agent: List[EscoResult]
    processing_time: float
    model_used: str