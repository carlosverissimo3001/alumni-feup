"""Hermetic checks for the eval harness itself (no DB, no network, no LLM).

These guard the harness's own plumbing - fixture integrity, cost gating, and
report math - not the classification pipeline's accuracy, which is what the
harness is for measuring in the first place.
"""

from evals.harness.fixtures import load_fixtures, select_fixtures
from evals.harness.models import JudgeVerdict, RetrievalResult, RoleFixture
from evals.harness.report import judgment_report, retrieval_report


def _fixture(**overrides) -> RoleFixture:
    defaults = dict(
        id="r999",
        title="Software Developer",
        description=None,
        company_name="TechCo",
        industry_name="Software",
        group="normal",
        set="dev",
        challenge_tags=[],
        acceptable_esco_titles=["Software Developer"],
        acceptable_esco_codes=["2512.4"],
        automatic_ok=True,
        rationale="test fixture",
    )
    defaults.update(overrides)
    return RoleFixture(**defaults)


def test_fixture_file_has_80_unique_ids_split_40_40_and_60_20():
    fixtures = load_fixtures()

    assert len(fixtures) == 80
    assert len({f.id for f in fixtures}) == 80
    assert sum(1 for f in fixtures if f.group == "normal") == 40
    assert sum(1 for f in fixtures if f.group == "challenge") == 40
    assert sum(1 for f in fixtures if f.set == "dev") == 60
    assert sum(1 for f in fixtures if f.set == "holdout") == 20


def test_fixture_file_contains_both_known_regressions():
    fixtures = {f.id: f for f in load_fixtures()}

    investigadora = fixtures["r041"]
    assert investigadora.title == "Investigadora"
    assert "Criminal Investigator" not in investigadora.acceptable_esco_titles

    qa_ceiia = fixtures["r042"]
    assert qa_ceiia.company_name == "CEiiA"
    assert "Ict Quality Assurance Manager" not in qa_ceiia.acceptable_esco_titles


def test_select_fixtures_pins_known_regressions_even_under_a_small_n():
    fixtures = load_fixtures()

    selected = select_fixtures(fixtures, dataset="dev", n=5)

    assert len(selected) == 5
    assert {"r041", "r042"}.issubset({f.id for f in selected})


def test_select_fixtures_respects_dataset_split():
    fixtures = load_fixtures()

    holdout = select_fixtures(fixtures, dataset="holdout", n=None)

    assert all(f.set == "holdout" for f in holdout)
    assert len(holdout) == 20


def test_retrieval_report_computes_recall_and_skips_unlabeled_roles():
    fixtures_by_id = {
        "r1": _fixture(id="r1", acceptable_esco_codes=["A"]),
        "r2": _fixture(id="r2", acceptable_esco_codes=["B"]),
        "r3": _fixture(id="r3", acceptable_esco_codes=[]),  # deliberately unlabeled
    }
    results = [
        RetrievalResult(
            role_id="r1", acceptable_codes=["A"], ranked_codes=["A", "X"],
            latency_s=0.1, embedding_cost_usd=0.0, embedding_cached=True,
        ),
        RetrievalResult(
            role_id="r2", acceptable_codes=["B"], ranked_codes=["X", "Y"],
            latency_s=0.1, embedding_cost_usd=0.0, embedding_cached=True,
        ),
        RetrievalResult(
            role_id="r3", acceptable_codes=[], ranked_codes=["X"],
            latency_s=0.1, embedding_cost_usd=0.0, embedding_cached=True,
        ),
    ]

    report = retrieval_report(fixtures_by_id, results)

    assert report["n_scorable"] == 2
    assert report["n_no_acceptable_label"] == 1
    assert report["recall_at_8"] == 0.5  # r1 hits, r2 misses, r3 excluded


def test_judgment_report_flags_wrong_known_regression():
    fixtures_by_id = {
        "r041": _fixture(
            id="r041", title="Investigadora", challenge_tags=["known_regression"],
            acceptable_esco_codes=["2269.13"], acceptable_esco_titles=["Biomedical Scientist"],
        ),
    }
    results = [
        JudgeVerdict(
            role_id="r041",
            top_choice_title="Criminal Investigator",
            top_choice_confidence=0.9,
            top_choice_code="3355.1",
            results=[{"id": "x", "title": "Criminal Investigator", "confidence": 0.9}],
            candidates_had_acceptable=False,
            valid_output=True,
        ),
    ]

    report = judgment_report(fixtures_by_id, results)

    assert report["known_regressions"][0]["correct"] is False
    assert report["precision_among_auto_accepted"] == 0.0
