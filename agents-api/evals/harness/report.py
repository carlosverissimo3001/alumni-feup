"""Builds the report tables described in CAR-466 for each harness mode."""

from __future__ import annotations

from typing import Dict, List

from evals.harness.models import JudgeVerdict, RetrievalResult, RoleFixture

AUTO_ACCEPT_CONFIDENCE_THRESHOLD = 0.6


def retrieval_report(
    fixtures_by_id: Dict[str, RoleFixture], results: List[RetrievalResult]
) -> dict:
    # Roles with no acceptable label (deliberately insufficient-evidence
    # fixtures) can't score a recall hit or miss, so they're excluded from the
    # recall denominator and counted separately.
    scorable = [r for r in results if r.acceptable_codes]
    unscorable = [r for r in results if not r.acceptable_codes]

    def recall_at(k: int, rows: List[RetrievalResult]) -> float:
        return round(sum(r.recall_at(k) for r in rows) / len(rows), 3) if rows else 0.0

    regressions = [r for r in results if fixtures_by_id[r.role_id].is_known_regression]

    return {
        "n_roles": len(results),
        "n_scorable": len(scorable),
        "n_no_acceptable_label": len(unscorable),
        "recall_at_8": recall_at(8, scorable),
        "recall_at_20": recall_at(20, scorable),
        "recall_at_8_normal": recall_at(
            8, [r for r in scorable if fixtures_by_id[r.role_id].group == "normal"]
        ),
        "recall_at_8_challenge": recall_at(
            8, [r for r in scorable if fixtures_by_id[r.role_id].group == "challenge"]
        ),
        "known_regressions": [
            {
                "role_id": r.role_id,
                "title": fixtures_by_id[r.role_id].title,
                "recall_at_8": r.recall_at(8),
                "recall_at_20": r.recall_at(20),
            }
            for r in regressions
        ],
        "avg_latency_s": (
            round(sum(r.latency_s for r in results) / len(results), 3) if results else 0.0
        ),
        "total_cost_usd": round(sum(r.embedding_cost_usd for r in results), 6),
        "avg_cost_usd_per_role": (
            round(sum(r.embedding_cost_usd for r in results) / len(results), 6) if results else 0.0
        ),
        "n_live_calls": sum(1 for r in results if not r.embedding_cached),
    }


def judgment_report(fixtures_by_id: Dict[str, RoleFixture], results: List[JudgeVerdict]) -> dict:
    valid = [r for r in results if r.valid_output]
    invalid = [r for r in results if not r.valid_output]

    def is_correct(r: JudgeVerdict) -> bool:
        fixture = fixtures_by_id[r.role_id]
        if not fixture.acceptable_esco_codes:
            return False
        return r.top_choice_code in fixture.acceptable_esco_codes

    had_acceptable = [r for r in valid if r.candidates_had_acceptable]
    accuracy_given_acceptable_present = (
        round(sum(is_correct(r) for r in had_acceptable) / len(had_acceptable), 3)
        if had_acceptable
        else 0.0
    )

    auto_accepted = [
        r for r in valid if (r.top_choice_confidence or 0) >= AUTO_ACCEPT_CONFIDENCE_THRESHOLD
    ]
    precision_among_auto_accepted = (
        round(sum(is_correct(r) for r in auto_accepted) / len(auto_accepted), 3)
        if auto_accepted
        else 0.0
    )
    auto_coverage_pct = round(100 * len(auto_accepted) / len(results), 1) if results else 0.0

    regressions = [r for r in results if fixtures_by_id[r.role_id].is_known_regression]
    wrong_regressions = [
        {
            "role_id": r.role_id,
            "title": fixtures_by_id[r.role_id].title,
            "chosen_title": r.top_choice_title,
            "acceptable_titles": fixtures_by_id[r.role_id].acceptable_esco_titles,
            "correct": is_correct(r),
        }
        for r in regressions
    ]

    return {
        "n_roles": len(results),
        "accuracy_given_acceptable_candidate_present": accuracy_given_acceptable_present,
        "n_roles_with_acceptable_candidate_present": len(had_acceptable),
        "auto_accept_confidence_threshold": AUTO_ACCEPT_CONFIDENCE_THRESHOLD,
        "precision_among_auto_accepted": precision_among_auto_accepted,
        "auto_coverage_pct": auto_coverage_pct,
        "n_auto_accepted": len(auto_accepted),
        "known_regressions": wrong_regressions,
        "invalid_output_rate": round(len(invalid) / len(results), 3) if results else 0.0,
        "n_invalid_output": len(invalid),
        "avg_latency_s": (
            round(sum(r.latency_s for r in results) / len(results), 3) if results else 0.0
        ),
        "total_cost_usd": round(sum(r.cost_usd for r in results), 6),
        "avg_cost_usd_per_role": (
            round(sum(r.cost_usd for r in results) / len(results), 6) if results else 0.0
        ),
    }


def print_report(mode: str, report: dict) -> None:
    print(f"\n=== {mode} report ===")
    for key, value in report.items():
        if isinstance(value, list):
            print(f"{key}:")
            for item in value:
                print(f"  {item}")
        else:
            print(f"{key}: {value}")
