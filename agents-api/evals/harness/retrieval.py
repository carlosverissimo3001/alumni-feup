"""Retrieval-only eval mode: recall@8 / recall@20 against the real ESCO table.

Queries `esco_classification` directly (SELECT only) by cosine distance on the
embedding column - the same table and distance metric production uses in
app.utils.agents.esco_reference.search_esco_classifications - but returns the
full top-20 ranked list rather than the rerank-and-truncate-to-5 production
does, so recall can be measured at both k=8 and k=20 independently of the
cross-encoder reranking step.
"""

from __future__ import annotations

import time
from typing import List

from sqlalchemy import select

from app.db.models import EscoClassification
from app.db.session import SessionLocal
from app.utils.embeddings import generate_embedding
from evals.harness.costs import EMBEDDING_MODEL, count_tokens, estimate_cost_usd
from evals.harness.embedding_cache import EmbeddingCache
from evals.harness.models import RetrievalResult, RoleFixture

TOP_K = 20


def _fetch_ranked_codes(embedding: List[float], top_k: int = TOP_K) -> List[str]:
    db = SessionLocal()
    try:
        distance = EscoClassification.embedding.cosine_distance(embedding)
        stmt = (
            select(EscoClassification.code)
            .where(EscoClassification.is_leaf.is_(True))
            .order_by(distance)
            .limit(top_k)
        )
        return [row[0] for row in db.execute(stmt).all()]
    finally:
        db.close()


def evaluate_retrieval(
    fixtures: List[RoleFixture],
    *,
    live: bool,
    cache: EmbeddingCache,
) -> List[RetrievalResult]:
    results: List[RetrievalResult] = []
    for fixture in fixtures:
        start = time.monotonic()
        embedding, was_cached = cache.get_or_fetch(
            fixture.query_text,
            EMBEDDING_MODEL,
            live=live,
            fetch_fn=generate_embedding,
        )
        ranked_codes = _fetch_ranked_codes(embedding)
        latency_s = time.monotonic() - start

        cost_usd = 0.0 if was_cached else estimate_cost_usd(
            EMBEDDING_MODEL, count_tokens(fixture.query_text)
        )

        results.append(
            RetrievalResult(
                role_id=fixture.id,
                acceptable_codes=fixture.acceptable_esco_codes,
                ranked_codes=ranked_codes,
                latency_s=latency_s,
                embedding_cost_usd=cost_usd,
                embedding_cached=was_cached,
            )
        )
    return results
