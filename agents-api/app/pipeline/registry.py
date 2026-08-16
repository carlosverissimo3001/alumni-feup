"""Which service each stage drives, and over which entities.

Only CLASSIFY_ROLES is converted (CAR-157). The other stages keep their existing
coarse tasks until they are converted one at a time against a proven executor,
so an unconverted stage is absent here rather than half-wired.

Services are imported inside the resolvers and handlers for the same reason
app/tasks/pipeline.py does it: importing them at module scope drags langchain
and torch into the web process, which only ever enqueues.
"""

from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.db.models import PipelineRun
from app.pipeline.executor import StageSpec
from app.pipeline.stages import PipelineEntityType, PipelineStageName


def _resolve_alumni(session: Session, run: PipelineRun) -> List[str]:
    """The alumni a run covers, from its params - all of them if unspecified.

    Mirrors the lookup request_alumni_classification does, but reads the scope
    from the run rather than from a function argument, so a resume recovers it
    from the database instead of needing it passed in again.
    """
    from app.utils.alumni_db import find_all, find_by_ids

    params = run.params or {}
    alumni_ids: Optional[str] = params.get("alumni_ids")

    alumni = find_by_ids(alumni_ids.split(","), session) if alumni_ids else find_all(session)
    return sorted({record.id for record in alumni})


async def _classify_roles(alumni_id: str) -> None:
    from app.services.job_classification import job_classification_service

    await job_classification_service.classify_roles_for_alumni(alumni_id)


STAGES: Dict[PipelineStageName, StageSpec] = {
    PipelineStageName.CLASSIFY_ROLES: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_classify_roles,
    ),
}


def spec_for(stage: PipelineStageName) -> Optional[StageSpec]:
    return STAGES.get(stage)
