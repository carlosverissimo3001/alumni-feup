"""Company staleness decisions (CAR-152).

Pure: the rule that decides whether a company needs enriching is the thing
CAR-158's planner asks before spending money, so it is worth being certain about
without needing a database to ask.
"""

from datetime import datetime, timedelta

import pytest

from app.pipeline.refresh import RefreshDecision, refresh_decision

NOW = datetime(2026, 8, 16, 12, 0, 0)
AFTER_DAYS = 180


class TestNeverEnriched:
    def test_a_company_with_no_timestamp_is_enriched(self):
        # NULL is the backfill value for every existing row, so this is the
        # decision the first planned run makes about almost the whole table.
        assert refresh_decision(None, now=NOW, after_days=AFTER_DAYS) is RefreshDecision.ENRICH


class TestStaleness:
    def test_older_than_the_threshold_is_refreshed(self):
        enriched = NOW - timedelta(days=AFTER_DAYS + 1)
        assert refresh_decision(enriched, now=NOW, after_days=AFTER_DAYS) is RefreshDecision.REFRESH

    def test_newer_than_the_threshold_is_skipped(self):
        enriched = NOW - timedelta(days=AFTER_DAYS - 1)
        assert refresh_decision(enriched, now=NOW, after_days=AFTER_DAYS) is RefreshDecision.SKIP

    def test_exactly_at_the_threshold_is_skipped(self):
        # Inclusive boundary, stated so it is a decision rather than an
        # accident of which comparison operator got typed.
        enriched = NOW - timedelta(days=AFTER_DAYS)
        assert refresh_decision(enriched, now=NOW, after_days=AFTER_DAYS) is RefreshDecision.SKIP

    def test_a_future_timestamp_is_skipped(self):
        # Clock skew between the worker and the database should not cause an
        # expensive re-enrichment.
        enriched = NOW + timedelta(days=1)
        assert refresh_decision(enriched, now=NOW, after_days=AFTER_DAYS) is RefreshDecision.SKIP


class TestThresholdIsHonoured:
    @pytest.mark.parametrize("after_days", [0, 1, 30, 365])
    def test_the_threshold_is_read_not_assumed(self, after_days):
        enriched = NOW - timedelta(days=after_days, seconds=1)
        assert refresh_decision(enriched, now=NOW, after_days=after_days) is RefreshDecision.REFRESH

    def test_a_zero_threshold_refreshes_anything_already_enriched(self):
        # The FULL refresh mode CAR-158 describes, expressed as a threshold.
        assert (
            refresh_decision(NOW - timedelta(seconds=1), now=NOW, after_days=0)
            is RefreshDecision.REFRESH
        )
