"""Tests for ESCO reranking.

The reranker is the step CAR-106 wants to improve, so pinning its contract now
gives that work a baseline to measure against.
"""

import pytest

from app.schemas.job_classification import EscoResult
from app.utils.agents import esco_reference


class StubCrossEncoder:
    """Returns scores by lookup on the candidate title, in call order."""

    def __init__(self, scores_by_title):
        self._scores = scores_by_title
        self.pairs_seen = None

    def predict(self, pairs):
        self.pairs_seen = pairs
        return [self._scores[title] for _query, title in pairs]


@pytest.fixture
def results():
    return [
        EscoResult(id="1", title="Software developer", confidence=0.70),
        EscoResult(id="2", title="Systems analyst", confidence=0.90),
        EscoResult(id="3", title="Data entry clerk", confidence=0.50),
    ]


@pytest.fixture
def stub_encoder(monkeypatch):
    def _install(scores_by_title):
        stub = StubCrossEncoder(scores_by_title)
        monkeypatch.setattr(esco_reference, "get_cross_encoder", lambda: stub)
        return stub

    return _install


def test_reorders_by_cross_encoder_score(stub_encoder, results):
    """The reranker's whole purpose: override embedding order with its own."""
    stub_encoder({"Software developer": 9.0, "Systems analyst": 1.0, "Data entry clerk": 5.0})

    ranked = esco_reference.rerank_esco("backend engineer", results)

    assert [r.title for r in ranked] == [
        "Software developer",
        "Data entry clerk",
        "Systems analyst",
    ]


def test_truncates_to_top_k(stub_encoder, results):
    stub_encoder({"Software developer": 9.0, "Systems analyst": 1.0, "Data entry clerk": 5.0})

    ranked = esco_reference.rerank_esco("backend engineer", results, top_k=2)

    assert [r.title for r in ranked] == ["Software developer", "Data entry clerk"]


def test_pairs_each_candidate_with_the_query(stub_encoder, results):
    stub = stub_encoder(
        {"Software developer": 1.0, "Systems analyst": 1.0, "Data entry clerk": 1.0}
    )

    esco_reference.rerank_esco("backend engineer", results)

    assert stub.pairs_seen == [
        ["backend engineer", "Software developer"],
        ["backend engineer", "Systems analyst"],
        ["backend engineer", "Data entry clerk"],
    ]


def test_empty_candidate_list_is_handled(stub_encoder):
    stub_encoder({})

    assert esco_reference.rerank_esco("backend engineer", []) == []


def test_cross_encoder_is_not_loaded_at_import():
    """Regression guard for the lazy-loading fix.

    Constructing the CrossEncoder reaches HuggingFace Hub on a cold cache, so a
    module-scope instance made this module unimportable without network access —
    and with it app.main. Keep the load behind the accessor.
    """
    esco_reference.get_cross_encoder.cache_clear()
    assert esco_reference.get_cross_encoder.cache_info().currsize == 0
