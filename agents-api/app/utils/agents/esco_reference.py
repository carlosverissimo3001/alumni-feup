from typing import List

from sqlalchemy import select

from app.db import get_db
from app.db.models import EscoClassification
from app.schemas.job_classification import EscoResult
from app.utils.embeddings import generate_embedding


def search_esco_classifications(query: str, top_k: int = 5) -> List[EscoResult]:
    """
    Search ESCO classifications using vector similarity in PostgreSQL

    Args:
        query: The job title or description to search for
        top_k: Number of similar classifications to return (default: 5)

    Returns:
        List[EscoResult]: A list of matching ESCO classifications with confidence scores
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
            select(EscoClassification.code, EscoClassification.title_en, computed_col)
            .where(EscoClassification.embedding.is_not(None))
            .order_by(computed_col)
            .limit(top_k)
        )

        results = db.execute(search_query).fetchall()

        return [
            EscoResult(
                code=row.code,
                title=row.title_en,
                # Note: We want a two-tier classification system, so we're hardcoding the level to 1 for now
                # Level 1 -> more general classification -> e.g. Software Developer
                # Level 2 -> more specific classification -> e.g. Backend Software Engineer
                level=1,
                # similarity_score of 0 (identical) -> confidence = 1
                # similarity_score of 2 (opposite) -> confidence = 0
                confidence=round((2.0 - float(row.similarity_score)) / 2.0, 2),
            )
            for row in results
        ]
    except Exception as e:
        raise Exception(f"Error searching ESCO classifications: {str(e)}")
