from typing import List

from sqlalchemy import select

from app.db import get_db
from app.db.models import EscoClassification
from app.schemas.job_classification import EscoResult
from app.utils.embeddings import generate_embedding


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
        # rerank_esco (an English-only MS MARCO cross-encoder) used to narrow this
        # down to 5. It has no multilingual training, so fed a non-English title
        # (e.g. PT "Investigadora") it reranks on surface lexical overlap with the
        # English ESCO titles ("Investigator") rather than meaning, and can push
        # the genuinely correct match out of the shortlist before the LLM ever
        # sees it. cosine similarity from text-embedding-3-large is itself
        # multilingual, so trusting its ordering directly removes that failure
        # mode; this is a correctness fix, not just a perf one - see CAR ticket
        # for the broader retrieval/validation redesign this is part of.
        return results[:8]
    except Exception as e:
        raise Exception(f"Error searching ESCO classifications: {str(e)}")
