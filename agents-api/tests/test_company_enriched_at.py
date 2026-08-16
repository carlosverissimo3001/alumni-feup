"""Company.enrichedAt is written by enrichment and nothing else (CAR-152).

The column exists because `updatedAt` is bumped by any write and so cannot say
whether a company was ever *enriched*. That distinction only holds if the write
site is the enrichment path alone, which is what these tests pin down:
`update_company` has two callers, and only one of them is enrichment.
"""

from datetime import datetime, timedelta, timezone

import pytest

from app.db.models import Company, Industry
from app.utils.company_db import mark_company_enriched, update_company


@pytest.fixture
def industry(db):
    row = Industry(name="Test Industry")
    db.add(row)
    db.flush()
    return row


@pytest.fixture
def company(db, industry):
    row = Company(name="Acme", industry_id=industry.id)
    db.add(row)
    db.flush()
    return row


class TestMarkCompanyEnriched:
    def test_sets_the_timestamp(self, db, company):
        assert company.enriched_at is None

        mark_company_enriched(company.id, db)
        db.refresh(company)

        assert company.enriched_at is not None

    def test_the_timestamp_is_now(self, db, company):
        before = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=5)

        mark_company_enriched(company.id, db)
        db.refresh(company)

        assert company.enriched_at >= before

    def test_moves_the_timestamp_forward_on_re_enrichment(self, db, company):
        company.enriched_at = datetime(2020, 1, 1)
        db.flush()

        mark_company_enriched(company.id, db)
        db.refresh(company)

        assert company.enriched_at > datetime(2020, 1, 1)

    def test_an_unknown_company_is_not_an_error(self, db):
        # Enrichment races deletion rarely, but a missing row must not take the
        # whole stage down after the work has already been paid for.
        mark_company_enriched("00000000-0000-0000-0000-000000000000", db)


class TestUpdateCompanyLeavesItAlone:
    def test_a_plain_update_does_not_mark_the_company_enriched(self, db, company, industry):
        # agents/location.py calls update_company to attach an HQ location. If
        # that set enriched_at, a company that was never enriched would look
        # fresh and the planner would skip it forever - which is exactly the
        # failure mode updatedAt already has.
        update_company(Company(id=company.id, name="Acme Updated"), db)
        db.refresh(company)

        assert company.name == "Acme Updated"
        assert company.enriched_at is None

    def test_a_plain_update_does_not_clear_an_existing_timestamp(self, db, company):
        stamped = datetime(2026, 1, 1)
        company.enriched_at = stamped
        db.flush()

        update_company(Company(id=company.id, name="Acme Again"), db)
        db.refresh(company)

        assert company.enriched_at == stamped
