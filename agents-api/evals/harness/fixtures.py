"""Loading and selecting rows from evals/fixtures/roles.jsonl."""

from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional

from evals.harness.models import RoleFixture

DEFAULT_FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "roles.jsonl"


def load_fixtures(path: Path = DEFAULT_FIXTURES_PATH) -> List[RoleFixture]:
    fixtures: List[RoleFixture] = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            fixtures.append(RoleFixture(**row))
    return fixtures


def select_fixtures(
    fixtures: List[RoleFixture],
    *,
    dataset: str = "dev",
    n: Optional[int] = None,
    always_include_regressions: bool = True,
) -> List[RoleFixture]:
    """Pick the roles a harness run will actually process.

    `n` caps the run (the cost-discipline default), but the two known
    regressions are pinned in regardless of where truncation would otherwise
    land, since the whole point of this harness is to never silently drop them
    from a small sample.
    """
    if dataset == "all":
        pool = list(fixtures)
    else:
        pool = [f for f in fixtures if f.set == dataset]

    if n is None or n >= len(pool):
        return pool

    pinned = [f for f in pool if always_include_regressions and f.is_known_regression]
    rest = [f for f in pool if f not in pinned]
    budget = max(n - len(pinned), 0)
    return pinned + rest[:budget]
