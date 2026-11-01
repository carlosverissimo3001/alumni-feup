"""Which service each stage drives, and over which entities.

CLASSIFY_ROLES (CAR-157), LINKEDIN, COMPANY, and SENIORITY are converted.
The other stages keep their existing coarse tasks until they are converted
one at a time against a proven executor, so an unconverted stage is absent
here rather than half-wired.

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
    # spend. Location resolution still fires in the background - LOCATION
    # isn't a converted stage yet, so it's the only thing doing that work.
    #
    # skip_followup_company_extraction=True (CAR-477/478): COMPANY below
    # already enriches every company this alumnus' roles reference, so the
    # service's own internal background extraction call would double the
    # (billed) BrightData calls for every pipeline-run-driven call. The
    # standalone re-extract path has no such follow-up and keeps firing it.
    await linkedin_service.extract_profile_data(
        alumni_id,
        skip_followup_classification=True,
        skip_followup_company_extraction=True,
    )


async def _classify_roles(alumni_id: str) -> None:
    from app.services.job_classification import job_classification_service

    # skip_followup_seniority=True: SENIORITY below already classifies this
    # alumnus explicitly right after, so the service's own internal
    # background seniority call would just be redundant LLM spend.
    await job_classification_service.classify_roles_for_alumni(
        alumni_id, skip_followup_seniority=True
    )


async def _classify_seniority(alumni_id: str) -> None:
    from app.schemas.seniority import AlumniSeniorityParams
    from app.services.seniority import seniority_service

    await seniority_service.request_alumni_seniority(AlumniSeniorityParams(alumni_ids=alumni_id))


def _resolve_companies(session: Session, run: PipelineRun) -> List[str]:
    """The companies this run covers: those linked to its alumni's roles that
    aren't enriched yet.

    Scoped to this run's alumni (not every unenriched company in the
    database) for the same reason _resolve_alumni is scoped - see CAR-465.
    A company can be referenced by multiple alumni's roles; dedup by id.
    """
    from app.db.models import Company, Role

    alumni_ids = _resolve_alumni(session, run)
    company_ids = (
        session.query(Role.company_id)
        .join(Company, Role.company_id == Company.id)
        .filter(Role.alumni_id.in_(alumni_ids), Company.enriched_at.is_(None))
        .distinct()
        .all()
    )
    return sorted({row[0] for row in company_ids})


async def _extract_company(company_id: str) -> None:
    from app.db.session import session_scope
    from app.services.company import company_service
    from app.utils.company_db import get_company_by_id

    # Session held for the lookup only, mirroring _extract_linkedin_profile's
    # alumni lookup above: the handler is given just an entity_id by the
    # executor (see executor.py's StageSpec.handle), so it opens its own
    # session to resolve the company's linkedin_url before the network call.
    with session_scope() as db:
        db_company = get_company_by_id(company_id, db)
        if not db_company or not db_company.linkedin_url:
            return
        company_url = db_company.linkedin_url

    await company_service.extract_company_data(company_url, company_id)


STAGES: Dict[PipelineStageName, StageSpec] = {
    PipelineStageName.LINKEDIN: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_extract_linkedin_profile,
    ),
    PipelineStageName.COMPANY: StageSpec(
        entity_type=PipelineEntityType.COMPANY,
        resolve=_resolve_companies,
        handle=_extract_company,
    ),
    PipelineStageName.CLASSIFY_ROLES: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_classify_roles,
    ),
    PipelineStageName.SENIORITY: StageSpec(
        entity_type=PipelineEntityType.ALUMNI,
        resolve=_resolve_alumni,
        handle=_classify_seniority,
    ),
}


def spec_for(stage: PipelineStageName) -> Optional[StageSpec]:
    return STAGES.get(stage)
