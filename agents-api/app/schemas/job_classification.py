from pydantic import BaseModel, Field
from typing import Optional, List


class JobClassificationBase(BaseModel):
    """Base schema for job classification."""

    title: str = Field(..., description="The job title to classify")
    description: Optional[str] = Field(
        None, description="Optional job description for better classification"
    )


class JobClassificationRequest(JobClassificationBase):
    """Schema for job classification request."""

    pass


class EscoResult(BaseModel):
    """Schema for ESCO classification result."""

    code: str = Field(..., description="ESCO classification code")
    label: str = Field(..., description="ESCO classification label")
    level: int = Field(..., description="ESCO classification level")
    confidence: float = Field(..., description="Confidence score of the classification")


class JobClassificationResponse(JobClassificationBase):
    """Schema for job classification response."""

    id: str = Field(..., description="Unique identifier for the classification")
    results: List[EscoResult] = Field(..., description="List of ESCO classification results")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    model_used: Optional[str] = Field(None, description="Name of the model used for classification")

    class Config:
        from_attributes = True
