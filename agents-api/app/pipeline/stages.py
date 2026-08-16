"""Pipeline enum values, mirrored from the Prisma schema.

These live here rather than in `app.db.models` because the stage machine has to
be importable without a database: `app.db.__init__` imports `session`, which
calls `create_engine` at module scope, so importing an enum from there would
construct an engine as a side effect. `app.db.models` imports these for its
Column definitions, so the values still have one definition.
"""

import enum


class PipelineKind(str, enum.Enum):
    REFRESH_EXISTING = "REFRESH_EXISTING"
    INGEST_COHORT = "INGEST_COHORT"


class PipelineTrigger(str, enum.Enum):
    ADMIN_UI = "ADMIN_UI"
    API = "API"
    SCHEDULE = "SCHEDULE"


class PipelineRunStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    PLANNED = "PLANNED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class PipelineStageName(str, enum.Enum):
    PLAN = "PLAN"
    LINKEDIN = "LINKEDIN"
    COMPANY = "COMPANY"
    CLASSIFY_ROLES = "CLASSIFY_ROLES"
    SENIORITY = "SENIORITY"
    LOCATION = "LOCATION"


class PipelineStageStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class PipelineTaskStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class PipelineEntityType(str, enum.Enum):
    ALUMNI = "ALUMNI"
    ROLE = "ROLE"
    COMPANY = "COMPANY"
    LOCATION = "LOCATION"


TERMINAL_TASK_STATUSES = frozenset(
    {
        PipelineTaskStatus.SUCCEEDED,
        PipelineTaskStatus.FAILED,
        PipelineTaskStatus.SKIPPED,
    }
)
