from functools import lru_cache
from typing import List

from sentence_transformers.cross_encoder import CrossEncoder
from sqlalchemy import select

from app.db import get_db
from app.db.models import EscoClassification
from app.schemas.job_classification import EscoResult
from app.utils.embeddings import generate_embedding

# Keep in sync with scripts/prefetch_models.py, which warms the HF cache at build time.
CROSS_ENCODER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


@lru_cache(maxsize=1)
def get_cross_encoder() -> CrossEncoder:
    """Load the reranker on first use, not at import.

    Constructing a CrossEncoder reaches out to the HuggingFace Hub whenever the
    local cache is cold, so doing it at module scope made this module — and
    everything importing it, including app.main — impossible to import without
    network access. Deferring the load also keeps it off the startup path.
    """
    return CrossEncoder(CROSS_ENCODER_MODEL, device="cpu")


def search_esco_classifications(query: str, top_k: int = 20) -> List[EscoResult]:
    """
    Search ESCO classifications using vector similarity in PostgreSQL

    Args:
        query: The job title or description to search for
        top_k: Number of similar classifications to return (default: 20)

    Returns:
        List[EscoResult]: A list of matching ESCO classifications with confidence scores that reflect both
        absolute similarity and relative ranking. Confidence scores are between 0 and 1, where:
        - Scores > 0.8 indicate very strong matches
        - Scores 0.6-0.8 indicate good matches
        - Scores < 0.6 indicate weaker matches that should be reviewed carefully
    """
    try:
        # Generate embedding for the query
        query_embedding = generate_embedding(query)

        # Get database session
        db = next(get_db())

        computed_col = (EscoClassification.embedding.cosine_distance(query_embedding)).label(
            "similarity_score"
        )

        search_query = (
            select(
                EscoClassification.id,
                EscoClassification.code,
                EscoClassification.title_en,
                computed_col,
            )
            .where(EscoClassification.is_leaf.is_(True))
            .order_by(computed_col)
            .limit(top_k)
        )

        results = db.execute(search_query).fetchall()

        if not results:
            return []

        # Find the best similarity score (lowest distance)
        best_score = min(float(row.similarity_score) for row in results)

        # Convert to confidence scores that balance absolute and relative similarity
        # - Uses absolute similarity to ensure high confidence only for genuinely good matches
        # - Also considers relative similarity to preserve ranking
        # - Applies a scaling factor to ensure reasonable confidence distribution
        results = [
            EscoResult(
                id=row.id,
                code=row.code,
                title=row.title_en,
                # Base confidence from absolute similarity (0 to 1)
                confidence=round(
                    # Start with absolute similarity (0 to 1)
                    ((2.0 - float(row.similarity_score)) / 2.0)
                    *
                    # Multiply by relative similarity factor (penalizes matches much worse than best)
                    ((2.0 - float(row.similarity_score)) / (2.0 - best_score)),
                    2,
                ),
            )
            for row in results
        ]
        return rerank_esco(query, results, top_k=5)
    except Exception as e:
        raise Exception(f"Error searching ESCO classifications: {str(e)}")


def rerank_esco(query: str, results: List[EscoResult], top_k: int = 5) -> List[EscoResult]:
    pairs = [[query, r.title] for r in results]
    scores = get_cross_encoder().predict(pairs)
    ranked = sorted(zip(results, scores), key=lambda x: x[1], reverse=True)
    return [r for r, _ in ranked[:top_k]]
