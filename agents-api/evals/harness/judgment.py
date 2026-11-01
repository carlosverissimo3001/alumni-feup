"""Judgment-only eval mode: LLM validation against saved candidate packets.

No embedding calls and no DB reads happen in this mode - only the LLM
validation call, against whatever candidates were frozen into the packet by
`evals.harness.packets.build_packet`. This is what CAR-467/468-style prompt or
model changes should be measured against.
"""

from __future__ import annotations

from pathlib import Path
from typing import List

from evals.harness.judge import judge_role
from evals.harness.models import JudgeVerdict, RoleFixture
from evals.harness.packets import DEFAULT_PACKETS_DIR, load_packet


def evaluate_judgment(
    fixtures: List[RoleFixture],
    *,
    live: bool,
    packets_dir: Path = DEFAULT_PACKETS_DIR,
) -> List[JudgeVerdict]:
    results: List[JudgeVerdict] = []
    missing = []
    for fixture in fixtures:
        packet = load_packet(fixture.id, packets_dir)
        if packet is None:
            missing.append(fixture.id)
            continue
        results.append(judge_role(fixture, packet.candidates, live=live))

    if missing:
        raise RuntimeError(
            f"No candidate packet for roles: {missing}. Build packets first with "
            "`--mode retrieval --build-packets --live` (one embedding call per "
            "missing role, then reusable forever)."
        )
    return results
