"""skip_followup_company_extraction on process_profile_data/_persist_profile_data (CAR-477/478).

_persist_profile_data fires company_service.extract_company_data as a
background fire-and-forget task whenever it sees a brand-new company. That
duplicates the explicit enrichment a pipeline run's COMPANY stage already does
for the same companies right after LINKEDIN, so a caller running inside such a
sequence passes skip_followup_company_extraction=True to suppress it. The
standalone extraction path (the single-alumni manual re-extract trigger, with
no such follow-up) has no reason to pass it and must keep firing the
background call exactly as before.

Mirrors test_linkedin_followup_classification.py's precedent for the sibling
skip_followup_classification flag.
"""

from app.schemas.linkedin import ExperienceBase, ExperienceDate, LinkedInProfileResponse
from app.services import location as location_module
from app.services.linkedin import LinkedInService
from app.services.linkedin import company_service as linkedin_company_service

ROLE = ExperienceBase(
    title="Engineer",
    company="Acme",
    company_linkedin_profile_url="https://www.linkedin.com/company/acme",
    starts_at=ExperienceDate(year=2020, month=1, day=1),
)
PROFILE = LinkedInProfileResponse(experiences=[ROLE])


class _NullContext:
    def __init__(self, db):
        self._db = db

    def __enter__(self):
        return self._db

    def __exit__(self, *exc_info):
        return False


class _NewCompany:
    id = "company-1"


def _service(monkeypatch, db):
    service = LinkedInService()

    async def no_classification(*args, **kwargs):
        return None

    monkeypatch.setattr(
        "app.services.linkedin.job_classification_service.request_alumni_classification",
        no_classification,
    )

    async def no_location(*args, **kwargs):
        return None

    monkeypatch.setattr(
        location_module.location_service, "resolve_role_location_for_alumni", no_location
    )

    # Short-circuit the rest of _persist_profile_data's unit of work: what is
    # under test is only whether the company-extraction background task gets
    # created, not alumni/role persistence.
    monkeypatch.setattr("app.services.linkedin.session_scope", lambda: _NullContext(db))
    monkeypatch.setattr("app.services.linkedin.get_company_by_linkedin_url", lambda url, db: None)
    monkeypatch.setattr("app.services.linkedin.insert_company", lambda company, db: _NewCompany())

    async def no_parse_role(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.linkedin.role_service.parse_role", no_parse_role)

    return service


async def _extraction_calls(monkeypatch):
    calls = []

    async def fake_extract(*args, **kwargs):
        calls.append(args)

    monkeypatch.setattr(linkedin_company_service, "extract_company_data", fake_extract)
    return calls


class TestSkipFollowupCompanyExtraction:
    async def test_pipeline_triggered_call_does_not_fire_company_extraction(self, monkeypatch, db):
        service = _service(monkeypatch, db)
        calls = await _extraction_calls(monkeypatch)

        await service.process_profile_data(
            PROFILE,
            "alumni-1",
            skip_followup_classification=True,
            skip_followup_company_extraction=True,
        )
        await service.close()

        assert calls == []

    async def test_standalone_call_keeps_firing_company_extraction(self, monkeypatch, db):
        service = _service(monkeypatch, db)
        calls = await _extraction_calls(monkeypatch)

        # Default behaviour, unchanged: the manual re-extract trigger calls
        # this with no flag at all.
        await service.process_profile_data(PROFILE, "alumni-1")
        await service.close()

        assert calls == [("https://linkedin.com/company/acme/", "company-1")]
