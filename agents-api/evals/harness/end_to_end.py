"""End-to-end eval mode: real retrieval + real validation, no DB writes.

This chains the same two read-only steps app.agents.job_classification runs
(get_best_esco_matches_db, then LLM validation) but stops there - it never
calls batch_update_classifications or _process_roles_batch, so no role or
job_classification row is touched and no seniority task is scheduled.
"""

from __future__ import annotations

from typing import List

from evals.harness.embedding_cache import EmbeddingCache
from evals.harness.judge import judge_role
from evals.harness.models import JudgeVerdict, RoleFixture
from evals.harness.packets import build_packet


def evaluate_end_to_end(
    fixtures: List[RoleFixture],
    *,
    live: bool,
    cache: EmbeddingCache,
) -> List[JudgeVerdict]:
    results: List[JudgeVerdict] = []
    for fixture in fixtures:
        packet = build_packet(fixture, live=live, cache=cache)
        results.append(judge_role(fixture, packet.candidates, live=live))
    return results
