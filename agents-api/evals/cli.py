"""Entry point for the job-classification eval harness. See evals/README.md.

Run as a module from agents-api/: `uv run python -m evals.cli --mode retrieval`
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from evals.harness.embedding_cache import DEFAULT_CACHE_PATH, EmbeddingCache
from evals.harness.end_to_end import evaluate_end_to_end
from evals.harness.fixtures import DEFAULT_FIXTURES_PATH, load_fixtures, select_fixtures
from evals.harness.judgment import evaluate_judgment
from evals.harness.packets import DEFAULT_PACKETS_DIR, build_packet, save_packet
from evals.harness.report import judgment_report, print_report, retrieval_report
from evals.harness.retrieval import evaluate_retrieval

DEFAULT_N = 10
REPORTS_DIR = Path(__file__).resolve().parent / ".reports"


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        required=True,
        choices=["retrieval", "judgment", "end_to_end", "build_packets"],
        help="retrieval: recall@8/@20 against the live ESCO table. "
        "judgment: LLM validation against saved candidate packets. "
        "end_to_end: real retrieval + real validation, no DB writes. "
        "build_packets: (re)generate candidate packets for judgment mode.",
    )
    parser.add_argument("--dataset", choices=["dev", "holdout", "all"], default="dev")
    parser.add_argument(
        "--n",
        type=int,
        default=DEFAULT_N,
        help=f"Cap on roles processed (default {DEFAULT_N}). Ignored with --full.",
    )
    parser.add_argument(
        "--full", action="store_true", help="Process every role in --dataset instead of --n."
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Allow real OpenAI calls for anything not already cached/packeted. "
        "Without this flag, missing data is a hard error instead of a silent spend.",
    )
    parser.add_argument("--fixtures", type=Path, default=DEFAULT_FIXTURES_PATH)
    parser.add_argument("--packets-dir", type=Path, default=DEFAULT_PACKETS_DIR)
    parser.add_argument("--cache-path", type=Path, default=DEFAULT_CACHE_PATH)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv if argv is not None else sys.argv[1:])

    all_fixtures = load_fixtures(args.fixtures)
    n = None if args.full else args.n
    fixtures = select_fixtures(all_fixtures, dataset=args.dataset, n=n)
    fixtures_by_id = {f.id: f for f in all_fixtures}

    print(
        f"mode={args.mode} dataset={args.dataset} n_roles={len(fixtures)} "
        f"live={args.live} (default N is {DEFAULT_N}; pass --full for all "
        f"{sum(1 for f in all_fixtures if args.dataset == 'all' or f.set == args.dataset)} "
        f"{args.dataset} roles)"
    )

    cache = EmbeddingCache(args.cache_path)

    if args.mode == "build_packets":
        built = 0
        for fixture in fixtures:
            packet = build_packet(fixture, live=args.live, cache=cache)
            save_packet(packet, args.packets_dir)
            built += 1
        print(f"built/updated {built} candidate packets in {args.packets_dir}")
        report = {"n_packets_built": built}

    elif args.mode == "retrieval":
        results = evaluate_retrieval(fixtures, live=args.live, cache=cache)
        report = retrieval_report(fixtures_by_id, results)
        print_report(args.mode, report)

    elif args.mode == "judgment":
        results = evaluate_judgment(fixtures, live=args.live, packets_dir=args.packets_dir)
        report = judgment_report(fixtures_by_id, results)
        print_report(args.mode, report)

    else:  # end_to_end
        results = evaluate_end_to_end(fixtures, live=args.live, cache=cache)
        report = judgment_report(fixtures_by_id, results)
        print_report(args.mode, report)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = REPORTS_DIR / f"{stamp}-{args.mode}-{args.dataset}.json"
    out_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    print(f"\nreport written to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
