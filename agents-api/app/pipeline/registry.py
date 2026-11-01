"""Which service each stage drives, and over which entities.

CLASSIFY_ROLES (CAR-157), LINKEDIN, and LOCATION are converted. The other
stages keep their existing coarse tasks until they are converted one at a time
against a proven executor, so an unconverted stage is absent here rather than
half-wired.

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
    """The alumni a run covers, from its params.

    Falling back to every alumni record when alumni_ids is absent is safe here
    only because the create-run endpoint (CAR-465) already required an explicit
    confirm_all_alumni before a run with no alumni_ids could be created.

    Mirrors the lookup request_alumni_classification does, but reads the scope
    from the run rather than from a function argument, so a resume recovers it
    from the database instead of needing it passed in again.
    """
    from app.utils.alumni_db import find_all, find_by_ids

    params = run.params or {}
    alumni_ids: Optional[str] = params.get("alumni_ids")

    alumni = find_by_ids(alumni_ids.split(","), session) if alumni_ids else find_all(session)
    return sorted({record.id for record in alumni})


async def _extract_linkedin_profile(alumni_id: str) -> None:
    from app.services.linkedin import linkedin_service

    # skip_followup_classification=True (CAR-474): CLASSIFY_ROLES below already
    # classifies this alumnus explicitly right after, so the service's own
    # internal background classification call would just be redundant LLM
    # spend. skip_followup_location=True for the same reason: LOCATION below
    # already resolves this alumnus explicitly, so the service's own internal
    # background location call would just double the LLM spend.
    await linkedin_service.extract_profile_data(
        alumni_id, skip_followup_classification=True, skip_followup_location=True
    )


async def _classify_roles(alumni_id: str) -> None:
    from app.services.job_classification import job_classification_service

    await job_classification_service.classify_roles_for_alumni(alumni_id)


async def _resolve_location(alumni_id: str) -> None:
    from app.services.location import location_service

    await location_service.resolve_role_location_for_alumni(alumni_id)


STAGES: Dict[PipelineStageName, StageSpec] = {
    PipelineStageName.LINKEDIN: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_extract_linkedin_profile,
    ),
    PipelineStageName.CLASSIFY_ROLES: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_classify_roles,
    ),
    PipelineStageName.LOCATION: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_resolve_location,
    ),
}


def spec_for(stage: PipelineStageName) -> Optional[StageSpec]:
    return STAGES.get(stage)
