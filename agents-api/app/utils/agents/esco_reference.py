from typing import List, TypedDict

from langchain_core.tools import tool
from sqlalchemy import select

from app.db import get_db
from app.db.models import EscoClassification
from app.schemas.job_classification import EscoResult
from app.utils.embeddings import generate_embedding
from app.utils.esco_db import get_classification_by_code


class EscoClassificationInfo(TypedDict):
    code: str
    title_en: str
    definition: str
    tasks_include: str
    included_occupations: str
    excluded_occupations: str
    notes: str


@tool
def get_detailed_esco_classification(code: str) -> EscoClassificationInfo:
    """
    Use this tool to get a detailed ESCO classification from the database

    Args:
        code: The code of the ESCO classification to get

    Returns:
        EscoClassificationInfo: A dictionary containing the detailed ESCO classification information with the following fields:
        - code: The code of the ESCO classification
        - title_en: The English title of the ESCO classification
        - definition: The definition of the ESCO classification
        - tasks_include: The tasks included in the ESCO classification
        - included_occupations: The occupations included in the ESCO classification
        - excluded_occupations: The occupations excluded in the ESCO classification
        - notes: Any additional notes about the ESCO classification
    """
    esco_classification = get_classification_by_code(code)
    if esco_classification is None:
        raise Exception(f"ESCO classification with code {code} not found")

    return {
        "code": esco_classification.code,
        "title_en": esco_classification.title_en,
        "definition": esco_classification.definition,
        "tasks_include": esco_classification.tasks_include,
        "included_occupations": esco_classification.included_occupations,
        "excluded_occupations": esco_classification.excluded_occupations,
        "notes": esco_classification.notes,
    }


def search_esco_classifications(query: str, top_k: int = 5) -> List[EscoResult]:
    """
    Search ESCO classifications using vector similarity in PostgreSQL

    Args:
        query: The job title or description to search for
        top_k: Number of similar classifications to return (default: 5)

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
            .where(EscoClassification.embedding.is_not(None))
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
        return [
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
    except Exception as e:
        raise Exception(f"Error searching ESCO classifications: {str(e)}")
