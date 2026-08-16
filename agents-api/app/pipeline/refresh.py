"""Whether an entity's enrichment is stale enough to redo.

Pure, so CAR-158's planner can partition a whole table without a database round
trip per row, and so the rule that decides what a run spends money on is
testable without infrastructure.
"""

import enum
from datetime import datetime, timedelta
from typing import Optional


class RefreshDecision(str, enum.Enum):
    ENRICH = "ENRICH"
    REFRESH = "REFRESH"
    SKIP = "SKIP"


def refresh_decision(
    enriched_at: Optional[datetime], now: datetime, after_days: int
) -> RefreshDecision:
    """Classify one entity by how long ago it was enriched.

    ENRICH and REFRESH both mean work, but they are distinct because a plan that
    says "47 never enriched, 88 stale" reads very differently from one that says
    "135 companies" - and the first is the one worth approving.

    Boundary is inclusive: exactly `after_days` old still counts as fresh. A
    timestamp in the future is treated as fresh rather than as work, so clock
    skew between the worker and the database cannot trigger a re-enrichment.
    """
    if enriched_at is None:
        return RefreshDecision.ENRICH

    if enriched_at >= now - timedelta(days=after_days):
        return RefreshDecision.SKIP

    return RefreshDecision.REFRESH
