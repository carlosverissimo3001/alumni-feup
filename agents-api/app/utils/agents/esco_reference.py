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
