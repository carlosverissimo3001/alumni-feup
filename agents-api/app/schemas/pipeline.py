"""Request and response models for the pipeline API.

Every field is typed because CAR-162 generates the TypeScript client from the
OpenAPI schema FastAPI derives from these. An untyped response produces an
`any`-typed SDK method, which is the pain CAR-79 documents on the NestJS side.
"""

from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

from app.pipeline.stages import (
    PipelineEntityType,
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineStageStatus,
    PipelineTaskStatus,
    PipelineTrigger,
)

ItemT = TypeVar("ItemT")


class Page(BaseModel, Generic[ItemT]):
    """A keyset page. FastAPI emits one named schema per instantiation."""

    items: List[ItemT]
    next_cursor: Optional[str] = Field(
        None, description="Pass back as `cursor` for the next page. Absent on the last page."
    )


class TaskCountsOut(BaseModel):
    total: int
    succeeded: int
    failed: int
    skipped: int
    pending: int


class StageSummary(BaseModel):
    stage: PipelineStageName
    sequence: int
    status: PipelineStageStatus
    total_count: int
    succeeded_count: int
    failed_count: int
    skipped_count: int
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    error: Optional[str]


class RunSummary(BaseModel):
    id: str
    kind: PipelineKind
    status: PipelineRunStatus
    trigger_source: PipelineTrigger
    triggered_by: Optional[str]
    params: Optional[Dict[str, Any]]
    created_at: datetime
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    error: Optional[str]
    counts: TaskCountsOut


class RunDetail(RunSummary):
    stages: List[StageSummary]


class TaskSummary(BaseModel):
    id: str
    entity_type: PipelineEntityType
    entity_id: str
    status: PipelineTaskStatus
    attempts: int
    error: Optional[str]
    result: Optional[Dict[str, Any]]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]


class CreateRunRequest(BaseModel):
    alumni_ids: Optional[str] = Field(
        None, description="Comma-separated alumni IDs. All alumni in scope when omitted."
    )
    failure_threshold: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Abort the run above this share of failed tasks. Defaults to 0.2.",
    )


class RunCreated(BaseModel):
    run_id: str


class RunAction(BaseModel):
    run_id: str
    enqueued_stage: Optional[PipelineStageName] = Field(
        None, description="The stage put on the queue, if any work needed doing."
    )
