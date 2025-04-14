import logging
from typing import List

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import EscoClassification

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_embedding(text: str) -> List[float]:
    """
    Generate an embedding for the given text using OpenAI's text-embedding-3-large model.
    
    Args:
        text: The text to generate an embedding for
        
    Returns:
        A list of floats representing the embedding vector
    """
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise

def generate_esco_embedding(esco: EscoClassification) -> List[float]:
    """
    Generate an embedding for an ESCO classification by combining its relevant fields.
    
    Args:
        esco: The ESCO classification to generate an embedding for
        
    Returns:
        A list of floats representing the embedding vector
    """
    text = f"""
    Title: {esco.title_en}
    Definition: {esco.definition}
    Tasks: {esco.tasks_include}
    Included Occupations: {esco.included_occupations}
    Excluded Occupations: {esco.excluded_occupations}
    Notes: {esco.notes if esco.notes else ''}
    """
    return generate_embedding(text.strip())

async def update_esco_embeddings(db: Session, batch_size: int = 100) -> None:
    """
    Update embeddings for all ESCO classifications that don't have them yet.
    
    Args:
        db: Database session
        batch_size: Number of classifications to process at once
    """
    try:
        classifications = db.query(EscoClassification).filter(
            EscoClassification.embedding.is_(None)
        ).all()
        
        logger.info(f"Found {len(classifications)} ESCO classifications without embeddings")
        
        # Process in batches
        for i in range(0, len(classifications), batch_size):
            batch = classifications[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1} of {(len(classifications)-1)//batch_size + 1}")  # noqa: E501
            
            for esco in batch:
                try:
                    embedding = generate_esco_embedding(esco)
                    esco.embedding = embedding
                    logger.debug(f"Generated embedding for ESCO code {esco.code}")
                except Exception as e:
                    logger.error(f"Error generating embedding for ESCO code {esco.code}: {str(e)}")
                    continue
            
            # Commit the batch
            db.commit()
            logger.info(f"Committed batch {i//batch_size + 1}")
            
        logger.info("Finished updating ESCO embeddings")
        
    except Exception as e:
        logger.error(f"Error updating ESCO embeddings: {str(e)}")
        db.rollback()
        raise 