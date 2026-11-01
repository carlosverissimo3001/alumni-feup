"""CAR-481: fetch-first-then-reconcile matching for LinkedIn-derived roles.

Uses the real (rolled-back) test database - this module does real joins
across Role/RoleRaw/Company that a hand-rolled fake session would struggle
to replicate faithfully, and the whole point under test is "what actually
lands in the database."
"""

from datetime import datetime, timedelta, timezone

import pytest

from app.db.models import (
    Alumni,
    Company,
    EscoClassification,
    Industry,
    JobClassification,
    Role,
    RoleRaw,
)
from app.schemas.linkedin import ExperienceBase, ExperienceDate
from app.services.role_reconciliation import compute_fingerprint, reconcile_alumni_roles


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


def _make_company(db, industry, linkedin_url="https://linkedin.com/company/acme/", **overrides):
    defaults = {"name": "Acme", "industry_id": industry.id, "linkedin_url": linkedin_url}
    defaults.update(overrides)
    row = Company(**defaults)
    db.add(row)
    db.flush()
    return row


def _make_role(db, alumni, company, **overrides):
    defaults = {
        "alumni_id": alumni.id,
        "company_id": company.id,
        "start_date": datetime(2020, 1, 1, tzinfo=timezone.utc),
    }
    defaults.update(overrides)
    row = Role(**defaults)
    db.add(row)
    db.flush()
    return row


def _make_role_raw(db, role, title="Software Engineer"):
    row = RoleRaw(role_id=role.id, title=title)
    db.add(row)
    db.flush()
    return row


def _experience(
    title="Software Engineer",
    company="Acme",
    company_url="https://linkedin.com/company/acme/",
    start=(2020, 1, 1),
    end=None,
    description=None,
):
    return ExperienceBase(
        title=title,
        company=company,
        company_linkedin_profile_url=company_url,
        description=description,
        starts_at=ExperienceDate(year=start[0], month=start[1], day=start[2]),
        ends_at=ExperienceDate(year=end[0], month=end[1], day=end[2]) if end else None,
    )


class TestComputeFingerprint:
    def test_same_inputs_produce_the_same_fingerprint(self):
        a = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "Engineer"
        )
        b = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "Engineer"
        )
        assert a == b

    def test_title_casing_and_whitespace_do_not_change_the_fingerprint(self):
        a = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "Engineer"
        )
        b = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "  engineer  "
        )
        assert a == b

    def test_a_different_title_changes_the_fingerprint(self):
        a = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "Engineer"
        )
        b = compute_fingerprint(
            "https://linkedin.com/company/acme/", datetime(2020, 1, 1), "Manager"
        )
        assert a != b


class TestReconcileNewRole:
    def test_inserts_a_genuinely_new_role(self, db, industry, remote_location):
        alumnus = _make_alumni(db)
        _make_company(db, industry)  # pre-existing, found by URL lookup

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience()])

        assert outcome.ok
        assert len(outcome.inserted_role_ids) == 1
        assert outcome.updated_role_ids == []
        role = db.query(Role).filter(Role.id == outcome.inserted_role_ids[0]).one()
        assert role.source_fingerprint is not None
        assert role.source_company_url == "https://linkedin.com/company/acme/"
        role_raw = db.query(RoleRaw).filter(RoleRaw.role_id == role.id).one()
        assert role_raw.title == "Software Engineer"

    def test_creates_a_new_company_when_none_exists(self, db, default_industry, remote_location):
        alumnus = _make_alumni(db)
        # No company pre-created this time - reconciliation must create one.

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience()])

        assert outcome.ok
        role = db.query(Role).filter(Role.id == outcome.inserted_role_ids[0]).one()
        company = db.query(Company).filter(Company.id == role.company_id).one()
        assert company.linkedin_url == "https://linkedin.com/company/acme/"

    def test_skips_an_experience_with_no_company_url(self, db):
        alumnus = _make_alumni(db)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(company_url=None)])

        assert outcome.ok
        assert outcome.inserted_role_ids == []


class TestReconcileExactMatch:
    def test_updates_an_already_fingerprinted_role_in_place(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Software Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(end=(2021, 6, 1))])

        assert outcome.ok
        assert outcome.updated_role_ids == [role.id]
        assert outcome.inserted_role_ids == []
        db.refresh(role)
        assert role.end_date is not None
        assert role.is_current is False

    def test_clears_missing_since_on_a_role_that_reappears(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Software Engineer"
        )
        role = _make_role(
            db,
            alumnus,
            company,
            source_fingerprint=fp,
            source_company_url=company.linkedin_url,
            source_missing_since=datetime.now(timezone.utc) - timedelta(days=1),
        )
        _make_role_raw(db, role)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience()])

        assert outcome.ok
        db.refresh(role)
        assert role.source_missing_since is None


class TestReconcileLegacyAdoption:
    def test_adopts_an_unfingerprinted_role_instead_of_duplicating_it(self, db, industry):
        """Roles created before CAR-481 have no fingerprint at all - the
        first reconciliation run must adopt them by exact (company, start,
        title) match, not insert a second copy."""
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        role = _make_role(db, alumnus, company)  # source_fingerprint is null
        _make_role_raw(db, role, title="Software Engineer")

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience()])

        assert outcome.ok
        assert outcome.updated_role_ids == [role.id]
        assert outcome.inserted_role_ids == []
        db.refresh(role)
        assert role.source_fingerprint is not None


class TestReconcileConflicts:
    def test_flags_a_possible_title_edit_as_a_conflict_and_changes_nothing(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        role = _make_role(db, alumnus, company)  # unfingerprinted
        _make_role_raw(db, role, title="Junior Engineer")

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(title="Senior Engineer")])

        assert not outcome.ok
        assert outcome.inserted_role_ids == []
        assert outcome.updated_role_ids == []
        # Nothing touched - the existing role is exactly as it was.
        db.refresh(role)
        assert role.source_fingerprint is None

    def test_flags_duplicate_entries_within_the_same_fetch_as_a_conflict(self, db, industry):
        alumnus = _make_alumni(db)
        _make_company(db, industry)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(), _experience()])

        assert not outcome.ok
        assert outcome.inserted_role_ids == []


class TestReconcileMissingRoles:
    def test_flags_a_fingerprinted_role_absent_from_the_new_fetch(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Software Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role)

        outcome = reconcile_alumni_roles(db, alumnus.id, [])  # nothing in the new fetch

        assert outcome.ok
        assert outcome.newly_missing_role_ids == [role.id]
        db.refresh(role)
        assert role.source_missing_since is not None
        # Never deleted.
        assert db.query(Role).filter(Role.id == role.id).first() is not None

    def test_does_not_flag_missing_roles_when_the_experiences_field_is_untrustworthy(
        self, db, industry
    ):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Software Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role)

        outcome = reconcile_alumni_roles(db, alumnus.id, [], experiences_field_present=False)

        assert outcome.ok
        assert outcome.newly_missing_role_ids == []
        db.refresh(role)
        assert role.source_missing_since is None

    def test_an_unfingerprinted_legacy_role_is_never_flagged_missing(self, db, industry):
        """A role this mechanism has never seen before (no fingerprint, no
        match this run either) is left alone - we don't know it's even a
        LinkedIn-originated role."""
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        role = _make_role(db, alumnus, company)
        _make_role_raw(db, role, title="A role fingerprinting has never touched")

        outcome = reconcile_alumni_roles(db, alumnus.id, [])

        assert outcome.ok
        assert outcome.newly_missing_role_ids == []
        db.refresh(role)
        assert role.source_missing_since is None


def _make_esco_classification(db):
    row = EscoClassification(
        level=4,
        code="1234.5",
        title_en="Software Developer",
        definition="Develops software.",
        tasks_include="Writing code.",
        included_occupations="",
        excluded_occupations="",
        esco_url="https://esco.example/1234.5",
        is_leaf=True,
    )
    db.add(row)
    db.flush()
    return row


def _make_job_classification(db, role, esco, **overrides):
    defaults = {
        "role_id": role.id,
        "esco_classification_id": esco.id,
        "model_used": "gpt-4o-mini",
    }
    defaults.update(overrides)
    row = JobClassification(**defaults)
    db.add(row)
    db.flush()
    return row


class TestReconcileInvalidatesStaleClassification:
    def test_a_real_title_change_clears_an_unprotected_classification(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Junior Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role, title="Junior Engineer")
        esco = _make_esco_classification(db)
        _make_job_classification(db, role, esco)

        # A matching fingerprint means the NEW experience's normalized title
        # must equal the OLD one for fingerprint matching to apply at all -
        # content change here comes from the description instead, which the
        # fingerprint doesn't cover.
        outcome = reconcile_alumni_roles(
            db,
            alumnus.id,
            [_experience(title="Junior Engineer", description="New responsibilities.")],
        )

        assert outcome.ok
        assert outcome.invalidated_classification_role_ids == [role.id]
        assert (
            db.query(JobClassification).filter(JobClassification.role_id == role.id).first() is None
        )

    def test_does_not_clear_a_user_corrected_classification(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Junior Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role, title="Junior Engineer")
        esco = _make_esco_classification(db)
        _make_job_classification(db, role, esco, was_modified_by_user=True)

        outcome = reconcile_alumni_roles(
            db,
            alumnus.id,
            [_experience(title="Junior Engineer", description="New responsibilities.")],
        )

        assert outcome.ok
        assert outcome.invalidated_classification_role_ids == []
        assert (
            db.query(JobClassification).filter(JobClassification.role_id == role.id).first()
            is not None
        )

    def test_no_content_change_leaves_classification_untouched(self, db, industry):
        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Junior Engineer"
        )
        role = _make_role(
            db, alumnus, company, source_fingerprint=fp, source_company_url=company.linkedin_url
        )
        _make_role_raw(db, role, title="Junior Engineer")
        esco = _make_esco_classification(db)
        _make_job_classification(db, role, esco)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(title="Junior Engineer")])

        assert outcome.ok
        assert outcome.invalidated_classification_role_ids == []
        assert (
            db.query(JobClassification).filter(JobClassification.role_id == role.id).first()
            is not None
        )


class TestReconcilePreservesHumanCorrections:
    def test_does_not_touch_seniority_level_of_a_user_corrected_role(self, db, industry):
        """CAR-480's protection is the seniority agent's job, not
        reconciliation's - but reconciliation must not reach in and
        overwrite it either, directly or incidentally."""
        from app.db.models import SeniorityLevel

        alumnus = _make_alumni(db)
        company = _make_company(db, industry)
        fp = compute_fingerprint(
            company.linkedin_url, datetime(2020, 1, 1, tzinfo=timezone.utc), "Software Engineer"
        )
        role = _make_role(
            db,
            alumnus,
            company,
            source_fingerprint=fp,
            source_company_url=company.linkedin_url,
            seniority_level=SeniorityLevel.DIRECTOR,
            was_seniority_level_modified_by_user=True,
        )
        _make_role_raw(db, role)

        outcome = reconcile_alumni_roles(db, alumnus.id, [_experience(end=(2021, 1, 1))])

        assert outcome.ok
        db.refresh(role)
        assert role.seniority_level == SeniorityLevel.DIRECTOR
        assert role.was_seniority_level_modified_by_user is True
