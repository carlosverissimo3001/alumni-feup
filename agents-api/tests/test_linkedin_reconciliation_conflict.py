"""CAR-481: a reconciliation conflict must surface as a failed task, not a
silent log line, and must leave the alumnus's data completely untouched -
including profile fields that would otherwise always update.

Uses the real (rolled-back) test database, same as test_role_reconciliation.py.
"""

from datetime import datetime, timezone

import pytest

from app.db.models import Alumni, Company, Industry, Role, RoleRaw
from app.schemas.linkedin import ExperienceBase, ExperienceDate, LinkedInProfileResponse
from app.services import location as location_module
from app.services.linkedin import LinkedInService
from app.services.role_reconciliation import ReconciliationConflictError


class _NullContext:
    def __init__(self, db):
        self._db = db

    def __enter__(self):
        return self._db

    def __exit__(self, *exc_info):
        return False


@pytest.fixture
def industry(db):
    row = Industry(name="Test Industry")
    db.add(row)
    db.flush()
    return row


def _alumnus(db):
    row = Alumni(
        first_name="Test",
        last_name="Alumnus",
        full_name="Test Alumnus",
        has_sigarra_match=False,
        profile_picture_url=None,
    )
    db.add(row)
    db.flush()
    return row


def _company(db, industry):
    row = Company(
        name="Acme", industry_id=industry.id, linkedin_url="https://linkedin.com/company/acme/"
    )
    db.add(row)
    db.flush()
    return row


def _service(monkeypatch, db):
    service = LinkedInService()

    async def noop(*args, **kwargs):
        return None

    monkeypatch.setattr(
        "app.services.linkedin.job_classification_service.request_alumni_classification", noop
    )
    monkeypatch.setattr(location_module.location_service, "resolve_role_location_for_alumni", noop)
    monkeypatch.setattr("app.services.linkedin.session_scope", lambda: _NullContext(db))

    return service


async def test_a_reconciliation_conflict_raises_and_leaves_the_alumnus_untouched(
    monkeypatch, db, industry
):
    alumnus = _alumnus(db)
    company = _company(db, industry)
    existing_role = Role(
        alumni_id=alumnus.id,
        company_id=company.id,
        start_date=datetime(2020, 1, 1, tzinfo=timezone.utc),
    )
    db.add(existing_role)
    db.flush()
    db.add(RoleRaw(role_id=existing_role.id, title="Junior Engineer"))
    db.flush()

    # Same company + start date, different title - an ambiguous possible
    # edit, which the real alumnus's unfingerprinted role above triggers.
    conflicting_profile = LinkedInProfileResponse(
        experiences=[
            ExperienceBase(
                title="Senior Engineer",
                company="Acme",
                company_linkedin_profile_url="https://linkedin.com/company/acme/",
                starts_at=ExperienceDate(year=2020, month=1, day=1),
            )
        ]
    )

    service = _service(monkeypatch, db)

    with pytest.raises(ReconciliationConflictError):
        await service.process_profile_data(
            conflicting_profile,
            alumnus.id,
            skip_followup_classification=True,
            skip_followup_location=True,
        )
    await service.close()

    # Nothing committed: the alumnus's profile fields were never reached.
    db.refresh(alumnus)
    assert alumnus.profile_picture_url is None
    db.refresh(existing_role)
    assert existing_role.source_fingerprint is None  # untouched
