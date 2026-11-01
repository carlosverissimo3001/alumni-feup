"""COMPANY as a converted pipeline stage: its resolver and handler.

_resolve_companies is the new piece here - unlike _resolve_alumni it resolves
per-company, scoped (like _resolve_alumni, CAR-465) to the run's alumni rather
than to every unenriched company in the database. These tests pin that scoping
down, plus the dedup a company shared across alumni needs.
"""

from datetime import datetime, timezone

import pytest

from app.db.models import Alumni, Company, Industry, PipelineRun, Role
from app.pipeline.registry import _resolve_companies
from app.pipeline.stages import PipelineKind, PipelineRunStatus


@pytest.fixture
def industry(db):
    row = Industry(name="Test Industry")
    db.add(row)
    db.flush()
    return row


def _make_alumni(db, **overrides):
    defaults = {
        "first_name": "Test",
        "last_name": "Alumnus",
        "full_name": "Test Alumnus",
        "has_sigarra_match": False,
    }
    defaults.update(overrides)
    row = Alumni(**defaults)
    db.add(row)
    db.flush()
    return row


def _make_company(db, industry, enriched=False, **overrides):
    defaults = {"name": "Acme", "industry_id": industry.id}
    if enriched:
        defaults["enriched_at"] = datetime.now(timezone.utc)
    defaults.update(overrides)
    row = Company(**defaults)
    db.add(row)
    db.flush()
    return row


def _make_role(db, alumni, company):
    row = Role(
        alumni_id=alumni.id,
        company_id=company.id,
        start_date=datetime(2020, 1, 1, tzinfo=timezone.utc),
    )
    db.add(row)
    db.flush()
    return row


def _make_run(db, alumni_ids):
    run = PipelineRun(
        kind=PipelineKind.REFRESH_EXISTING,
        status=PipelineRunStatus.PLANNING,
        params={"alumni_ids": ",".join(alumni_ids)},
    )
    db.add(run)
    db.flush()
    return run


class TestResolveCompanies:
    def test_includes_an_unenriched_company_linked_to_the_runs_alumni(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        _make_role(db, alumnus, company)
        run = _make_run(db, [alumnus.id])

        assert _resolve_companies(db, run) == [company.id]

    def test_excludes_already_enriched_companies(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry, enriched=True)
        _make_role(db, alumnus, company)
        run = _make_run(db, [alumnus.id])

        assert _resolve_companies(db, run) == []

    def test_dedups_a_company_shared_across_alumni(self, db, industry):
        alice = _make_alumni(db)
        bob = _make_alumni(db)
        company = _make_company(db, industry)
        _make_role(db, alice, company)
        _make_role(db, bob, company)
        run = _make_run(db, [alice.id, bob.id])

        assert _resolve_companies(db, run) == [company.id]

    def test_is_scoped_to_the_runs_alumni(self, db, industry):
        # A company referenced only by an alumnus outside this run's scope
        # must not show up - the same safety concern _resolve_alumni's
        # docstring calls out for CAR-465: no silent "every company" fallback.
        in_scope = _make_alumni(db)
        out_of_scope = _make_alumni(db)
        in_scope_company = _make_company(db, industry, name="In scope")
        out_of_scope_company = _make_company(db, industry, name="Out of scope")
        _make_role(db, in_scope, in_scope_company)
        _make_role(db, out_of_scope, out_of_scope_company)
        run = _make_run(db, [in_scope.id])

        assert _resolve_companies(db, run) == [in_scope_company.id]
