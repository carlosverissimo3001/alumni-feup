import logging
from typing import List, Optional
import time

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama

from app.core.config import settings
from app.schemas.job_classification import EscoResult

logger = logging.getLogger(__name__)

# Create Ollama LLM client
ollama_client = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.DEFAULT_MODEL,
)

# Create the prompt template for job classification
CLASSIFICATION_PROMPT = """
You are an expert job classifier using the European Skills, Competences, Qualifications and Occupations (ESCO) taxonomy.

Your task is to classify the following job title into the appropriate ESCO occupation:

Job Title: {job_title}
{job_description_text}

Return the top 3 most likely ESCO classifications in JSON format with the following structure:
```json
[
  {{
    "code": "ESCO code",
    "label": "ESCO occupation label",
    "level": "ESCO hierarchy level (integer)",
    "confidence": "confidence score between 0 and 1"
  }},
  ...
]
```

Only return the JSON, no other text.
"""

# Conditionally add job description to the prompt
job_description_template = """
Job Description:
{job_description}
"""


async def classify_job_title(
    job_title: str,
    job_description: Optional[str] = None,
) -> List[EscoResult]:
    """
    Classify a job title using the LLM and ESCO taxonomy.

    Args:
        job_title: The job title to classify
        job_description: Optional job description for better classification

    Returns:
        List of EscoResult objects with classification details
    """
    try:
        logger.info(f"Classifying job title: {job_title}")
        start_time = time.time()

        # Build the prompt with or without job description
        job_description_text = ""
        if job_description:
            job_description_text = job_description_template.format(job_description=job_description)

        # Create the full prompt template
        prompt = PromptTemplate(
            template=CLASSIFICATION_PROMPT,
            input_variables=["job_title", "job_description_text"],
        )

        # Create the classification chain
        classification_chain = LLMChain(
            llm=ollama_client,
            prompt=prompt,
        )

        # Run the chain
        result = await classification_chain.arun(
            job_title=job_title,
            job_description_text=job_description_text,
        )

        # Process the result (simplified version - would need more robust parsing in production)
        # For this example, we'll return dummy data
        # In a real scenario, you would parse the JSON result from the LLM

        # Dummy data for illustration
        esco_results = [
            EscoResult(
                code="2511.1",
                label="Systems Analyst",
                level=4,
                confidence=0.92,
            ),
            EscoResult(
                code="2512.1",
                label="Software Developer",
                level=4,
                confidence=0.85,
            ),
            EscoResult(
                code="2519.1",
                label="Software and Applications Developers and Analysts Not Elsewhere Classified",
                level=4,
                confidence=0.78,
            ),
        ]

        processing_time = time.time() - start_time
        logger.info(f"Classification completed in {processing_time:.2f} seconds")

        return esco_results

    except Exception as e:
        logger.error(f"Error in classify_job_title: {str(e)}")
        raise
