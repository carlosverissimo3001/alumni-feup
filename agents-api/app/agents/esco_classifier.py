import logging
from typing import Dict, List, Any, Optional, TypedDict, Annotated
import json

from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.chat_models import ChatOllama
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


# Define state structure
class ClassifierState(TypedDict):
    """State for the ESCOClassifier agent."""

    job_title: str
    job_description: Optional[str]
    research_findings: Optional[str]
    esco_matches: Optional[List[Dict[str, Any]]]
    final_classification: Optional[List[Dict[str, Any]]]
    error: Optional[str]


# Initialize LLM
def get_llm():
    """Get the LLM instance."""
    return ChatOllama(
        model=settings.DEFAULT_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.1,  # Low temperature for more deterministic outputs
    )


# Define nodes for the graph
def research_job(state: ClassifierState) -> ClassifierState:
    """Research the job title to gather relevant information."""
    logger.info(f"Researching job: {state['job_title']}")

    llm = get_llm()

    # Create the prompt
    research_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are a job research assistant. Your task is to gather and provide key information about 
        a job title. Focus on the typical responsibilities, skills, qualifications, and industry context
        for this role. Be thorough but concise.""",
            ),
            (
                "human",
                """Job Title: {job_title}
        
        {job_description_text}
        
        Please provide relevant information about this job role that would help classify it.""",
            ),
        ]
    )

    # Prepare the job description text
    job_description_text = ""
    if state.get("job_description"):
        job_description_text = f"Additional context: {state['job_description']}"

    # Invoke the LLM
    response = llm.invoke(
        research_prompt.format(
            job_title=state["job_title"],
            job_description_text=job_description_text,
        )
    )

    # Update the state
    return {
        **state,
        "research_findings": response.content,
    }


def find_esco_matches(state: ClassifierState) -> ClassifierState:
    """Find potential ESCO classification matches."""
    logger.info("Finding ESCO matches")

    llm = get_llm()

    # Create the prompt
    match_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are an expert in the European Skills, Competences, Qualifications and Occupations (ESCO) 
        classification system. Your task is to identify the most appropriate ESCO occupations for a given job title.
        
        Return ONLY a JSON array with the top 5 matching ESCO classifications in the following format:
        [
          {
            "code": "ESCO code, e.g., 2511.1",
            "label": "ESCO occupation label",
            "level": "ESCO hierarchy level (integer)",
            "confidence": "confidence score between 0 and 1",
            "reason": "brief explanation for this match"
          },
          ...
        ]
        """,
            ),
            (
                "human",
                """Job Title: {job_title}
        
        Research Findings:
        {research_findings}
        
        Find the most appropriate ESCO classifications for this job title.""",
            ),
        ]
    )

    try:
        # Invoke the LLM
        response = llm.invoke(
            match_prompt.format(
                job_title=state["job_title"],
                research_findings=state["research_findings"],
            )
        )

        # Extract the JSON part from the response
        json_str = response.content

        # Clean up the response to extract just the JSON
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        esco_matches = json.loads(json_str)

        # Update the state
        return {
            **state,
            "esco_matches": esco_matches,
        }
    except Exception as e:
        logger.error(f"Error parsing ESCO matches: {str(e)}")
        return {
            **state,
            "error": f"Failed to parse ESCO matches: {str(e)}",
            # Fallback with dummy data
            "esco_matches": [
                {
                    "code": "2511.1",
                    "label": "Systems Analyst",
                    "level": 4,
                    "confidence": 0.92,
                    "reason": "Fallback match due to parsing error",
                }
            ],
        }


def finalize_classification(state: ClassifierState) -> ClassifierState:
    """Finalize the ESCO classification based on matches."""
    logger.info("Finalizing classification")

    # If we have an error and fallback data, just return it
    if state.get("error"):
        return {
            **state,
            "final_classification": state["esco_matches"],
        }

    llm = get_llm()

    # Create the prompt
    final_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are a job classification expert. Review the potential ESCO matches for a job title
        and determine the final top 3 classifications in order of relevance. Consider the job description and
        research findings. 
        
        Return ONLY a JSON array with the final top 3 classifications in the following format:
        [
          {
            "code": "ESCO code",
            "label": "ESCO occupation label",
            "level": "ESCO hierarchy level (integer)",
            "confidence": "confidence score between 0 and 1"
          },
          ...
        ]
        """,
            ),
            (
                "human",
                """Job Title: {job_title}
        
        Job Description: {job_description}
        
        Research Findings:
        {research_findings}
        
        Potential ESCO Matches:
        {esco_matches}
        
        Provide the final top 3 ESCO classifications.""",
            ),
        ]
    )

    try:
        # Format the matches for the prompt
        matches_text = json.dumps(state["esco_matches"], indent=2)

        # Invoke the LLM
        response = llm.invoke(
            final_prompt.format(
                job_title=state["job_title"],
                job_description=state.get("job_description", "Not provided"),
                research_findings=state["research_findings"],
                esco_matches=matches_text,
            )
        )

        # Extract the JSON part from the response
        json_str = response.content

        # Clean up the response to extract just the JSON
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        final_classification = json.loads(json_str)

        # Update the state
        return {
            **state,
            "final_classification": final_classification,
        }
    except Exception as e:
        logger.error(f"Error parsing final classification: {str(e)}")
        # Return the top 3 from the matches as fallback
        return {
            **state,
            "error": f"Failed to parse final classification: {str(e)}",
            "final_classification": state["esco_matches"][:3],
        }


# Create the agent graph
def create_esco_classifier_graph() -> StateGraph:
    """Create the ESCO classifier agent graph."""
    workflow = StateGraph(ClassifierState)

    # Add nodes
    workflow.add_node("research_job", research_job)
    workflow.add_node("find_esco_matches", find_esco_matches)
    workflow.add_node("finalize_classification", finalize_classification)

    # Define the edges
    workflow.add_edge("research_job", "find_esco_matches")
    workflow.add_edge("find_esco_matches", "finalize_classification")
    workflow.add_edge("finalize_classification", END)

    # Set the entry point
    workflow.set_entry_point("research_job")

    return workflow


# Initialize the graph
esco_classifier_graph = create_esco_classifier_graph().compile()


async def classify_job_with_agent(
    job_title: str,
    job_description: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Classify a job title using the ESCO classifier agent.

    Args:
        job_title: The job title to classify
        job_description: Optional job description for better classification

    Returns:
        List of ESCO classification results
    """
    try:
        logger.info(f"Classifying job title with agent: {job_title}")

        # Initialize the state
        initial_state: ClassifierState = {
            "job_title": job_title,
            "job_description": job_description,
            "research_findings": None,
            "esco_matches": None,
            "final_classification": None,
            "error": None,
        }

        # Run the graph
        result = await esco_classifier_graph.ainvoke(initial_state)

        # Return the final classification
        return result["final_classification"]

    except Exception as e:
        logger.error(f"Error in classify_job_with_agent: {str(e)}")
        # Return a default response in case of error
        return [
            {
                "code": "error",
                "label": "Classification failed",
                "level": 0,
                "confidence": 0.0,
            }
        ]
