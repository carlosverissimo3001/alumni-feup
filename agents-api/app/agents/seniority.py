import json
import logging
import time
from json.decoder import JSONDecodeError

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.core.config import settings
from app.db import get_db
from app.db.models import SeniorityLevel
from app.schemas.seniority import BatchSeniorityInput, SeniorityAgentState, SeniorityOutput
from app.utils.prompts import SENIORITY_CLASSIFICATION_PROMPT
from app.utils.role_db import get_role_by_id, update_role

# Configure logging
logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())

# Initialize the LLM
cold_llm = ChatOpenAI(
    model=settings.OPENAI_DEFAULT_MODEL,
    temperature=0.0,
    api_key=settings.OPENAI_API_KEY,
)

# This agent doesn't need any tools for now
tools = []
llm_with_tools = cold_llm.bind_tools(tools)

tool_node = ToolNode(tools=tools)


def validate_batch_seniority_output(
    output_str: str, expected_role_ids: set[str]
) -> tuple[bool, str]:
    """Validates that the seniority classification output matches the required format"""
    try:
        result = json.loads(output_str)

        # Check if it's a valid BatchSeniorityOutput structure
        if not isinstance(result, dict):
            return False, "Result must be a dictionary"

        # Check required top-level fields
        required_fields = {"classifications", "career_summary"}
        if not all(field in result for field in required_fields):
            logger.warning(f"Missing required fields in output. Found: {result.keys()}")
            return False, f"Result must contain all fields: {required_fields}"

        if not isinstance(result["classifications"], list):
            return False, "classifications must be a list"

        if not isinstance(result["career_summary"], str):
            return False, "career_summary must be a string"

        # Validate each classification
        found_role_ids = set()
        for classification in result["classifications"]:
            # Check required fields only
            required_fields = {"role_id", "seniority", "confidence", "final_decision"}
            if not all(field in classification for field in required_fields):
                logger.warning(f"Invalid classification format: {classification}")
                return False, f"Each classification must contain required fields: {required_fields}"

            # Validate role_id
            if classification["role_id"] not in expected_role_ids:
                logger.warning(f"Unexpected role_id found: {classification['role_id']}")
                return False, f"Invalid role_id: {classification['role_id']}"

            found_role_ids.add(classification["role_id"])

            # Validate seniority level
            if classification["seniority"] not in SeniorityLevel.__members__:
                logger.warning(f"Invalid seniority level: {classification['seniority']}")
                return (
                    False,
                    f"Invalid seniority level. Must be one of: {list(SeniorityLevel.__members__.keys())}",
                )

            # Validate confidence
            if not isinstance(classification["confidence"], (int, float)):
                return False, "confidence must be a number"
            if not 0 <= classification["confidence"] <= 1:
                logger.warning(f"Invalid confidence value: {classification['confidence']}")
                return (
                    False,
                    f"confidence must be between 0 and 1, got: {classification['confidence']}",
                )

            # Validate final_decision
            if not isinstance(classification["final_decision"], str):
                return False, "final_decision must be a string"

        # Check if all expected role_ids are present
        if found_role_ids != expected_role_ids:
            missing_roles = expected_role_ids - found_role_ids
            logger.warning(f"Missing classifications for roles: {missing_roles}")
            return False, f"Missing classifications for roles: {missing_roles}"

        return True, ""
    except JSONDecodeError:
        logger.error("Failed to parse seniority output as JSON")
        return False, "Invalid JSON format"
    except Exception as e:
        logger.error(f"Unexpected error during validation: {str(e)}")
        return False, str(e)


class SeniorityAgent:
    def __init__(self):
        self.MAX_RETRIES = 3

    def create_graph(self) -> StateGraph:
        graph = StateGraph(SeniorityAgentState)

        # *** Nodes ***
        graph.add_node("classify_seniority", self.classify_seniority)
        graph.add_node("check_seniority_format", self.check_seniority_format)
        graph.add_node("update_roles_with_seniority", self.update_roles_with_seniority)

        # *** Edges ***
        graph.add_edge(START, "classify_seniority")
        graph.add_edge("classify_seniority", "check_seniority_format")

        graph.add_conditional_edges(
            "check_seniority_format",
            self.format_condition,
            {
                "valid": "update_roles_with_seniority",
                "retry": "classify_seniority",
                "error": END,
            },
        )

        graph.add_edge("update_roles_with_seniority", END)

        # *** Compile the graph ***
        compiled_graph = graph.compile()
        return compiled_graph

    def format_condition(self, state: SeniorityAgentState) -> str:
        """Determines the next step based on seniority classification format validation"""
        expected_role_ids = {role.role_id for role in state["batch"].roles}
        is_valid, error_msg = validate_batch_seniority_output(
            state["classification"], expected_role_ids
        )

        if is_valid:
            return "valid"

        state["error"] = error_msg
        state["retry_count"] = state.get("retry_count", 0) + 1
        logger.warning(
            f"Invalid format (attempt {state['retry_count']}/{self.MAX_RETRIES}): {error_msg}"
        )

        if state["retry_count"] < self.MAX_RETRIES:
            error_context = f"""
                Your previous response was invalid: {error_msg}

                You provided:
                {state["classification"]}

                CRITICAL: You must return ONLY a JSON object in this exact format, with no additional text:
                {{
                    "classifications": [
                        {{
                            "role_id": "<exact role ID>",
                            "seniority": "<SENIORITY_LEVEL>",
                            "confidence": <0.0-1.0>,
                            "final_decision": "<brief explanation of the decision>"
                        }}
                    ],
                    "career_summary": "<brief assessment of overall progression>"
                }}

                Required fields for each classification:
                - role_id: Must be one of: {list(expected_role_ids)}
                - seniority: Must be one of: {list(SeniorityLevel.__members__.keys())}
                - confidence: Must be a number between 0.0 and 1.0
                - final_decision: Brief explanation of the classification decision

                Optional fields (will be preserved if provided):
                - reasoning_steps
                - alternative_considered
                - consistency_check
                """
            state["messages"].append(SystemMessage(content=error_context))
            return "retry"

        logger.error(
            f"Failed to get valid seniority format after {self.MAX_RETRIES} attempts. Last error: {error_msg}"
        )
        return "error"

    def check_seniority_format(self, state: SeniorityAgentState) -> SeniorityAgentState:
        """Node that validates the seniority classification format"""
        return state

    def classify_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        """Classifies the seniority level of all roles in the batch"""
        batch = state["batch"]

        roles_context = "\n".join(
            f"Role {i + 1} (ID: {role.role_id}):\n"
            f"- Title: {role.title}\n"
            f"- Company: {role.company}\n"
            f"- Duration: {role.duration}\n"
            f"- Period: {role.start_date} to {role.end_date or 'Present'}\n"
            f"- ESCO Classification: {role.esco_classification or 'Not classified'}\n"
            f"- Current Role: {'Yes' if role.is_current else 'No'}\n"
            + (f"- Description: {role.description}\n" if role.description else "")
            for i, role in enumerate(batch.roles)
        )

        career_context = f"""
        Career Overview:
        - Total Professional Experience: {batch.total_experience}
        - Industries: {", ".join(batch.industries)}
        - Companies: {", ".join(batch.companies)}
        
        Roles in Chronological Order (from oldest to newest):
        {roles_context}
        """
        role_ids_str = ", ".join([f'"{role.role_id}"' for role in batch.roles])
        seniority_levels = "|".join(SeniorityLevel.__members__.keys())
        
        logger.info(f"Context: {career_context}")

        response = cold_llm.invoke(
            [
                SystemMessage(content=SENIORITY_CLASSIFICATION_PROMPT),
                SystemMessage(content=career_context),
                *state["messages"],
                HumanMessage(
                    content=f"""Please classify the seniority level of each role, considering the person's entire career progression.
                    Pay special attention to:
                    1. Role descriptions when available - they often contain key responsibilities and scope
                    2. Career progression patterns
                    3. Time spent in each role and total experience
                    4. Industry context and company transitions
                    
                    CRITICAL: Return ONLY the JSON object in this exact format, with no additional text.
                    Use these exact role IDs: [{role_ids_str}]

                    Format:
                    {{
                        "classifications": [
                            {{
                                "role_id": "<use one of the actual role IDs above>",
                                "seniority": "{seniority_levels}",
                                "confidence": 0.85,
                                "final_decision": "Brief explanation of classification decision",
                                "reasoning_steps": {{  # Optional
                                    "title_indicator": "What the title suggests",
                                    "experience_factor": "Years of experience assessment",
                                    "company_context": "Startup/enterprise adjustment",
                                    "career_position": "Where in overall timeline"
                                }},
                                "alternative_considered": "Next most likely level or null"  # Optional
                            }}
                        ],
                        "career_summary": "Overall assessment of career progression",
                        "consistency_check": "Any concerns or 'none'"  # Optional
                    }}
                    """
                ),
            ]
        )

        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        state["classification"] = content
        state["messages"].append(response)

        return state

    def update_roles_with_seniority(self, state: SeniorityAgentState) -> SeniorityAgentState:
        """Updates all roles in the database with their seniority classifications"""
        try:
            # Log raw LLM output
            logger.info(f"Raw LLM output:\n{state['classification']}")
            batch_output = json.loads(state["classification"])


            for classification in batch_output["classifications"]:
                role_id = classification["role_id"]

                role = get_role_by_id(role_id, db)
                if not role:
                    logger.error(f"Role {role_id} not found in database")
                    continue

                try:
                    try:
                        new_seniority = SeniorityLevel[classification["seniority"]]
                        logger.info(f"Validated seniority enum: {new_seniority}")
                    except KeyError:
                        logger.error(
                            f"Invalid seniority level {classification['seniority']} for role {role_id}"
                        )
                        continue

                    role.seniority_level = new_seniority

                    # Create metadata using the SAME seniority value
                    seniority_metadata = {
                        "role_id": classification["role_id"],
                        "seniority": new_seniority.value,
                        "confidence": classification["confidence"],
                        "final_decision": classification["final_decision"],
                        "model": state["model_used"],
                        "processing_time": state["processing_time"],
                        "career_summary": batch_output["career_summary"],
                    }

                    # Add optional fields if they exist
                    if "reasoning_steps" in classification:
                        seniority_metadata["reasoning_steps"] = classification["reasoning_steps"]
                    if "alternative_considered" in classification:
                        seniority_metadata["alternative_considered"] = classification[
                            "alternative_considered"
                        ]
                    if "consistency_check" in batch_output:
                        seniority_metadata["consistency_check"] = batch_output["consistency_check"]

                    metadata = role.metadata_ or {}
                    metadata["seniority_classification"] = seniority_metadata
                    role.metadata_ = metadata

                    update_role(role, db)

                except Exception as e:
                    logger.error(f"Error processing role {role_id}: {str(e)}", exc_info=True)
                    continue

            logger.info("Successfully updated all role classifications")

        except Exception as e:
            logger.error(f"Error updating roles with seniority: {str(e)}", exc_info=True)
            state["error"] = str(e)

        return state

    async def process_role_batch(self, input: BatchSeniorityInput) -> None:
        """Process a batch of roles and classify their seniority levels"""

        state = SeniorityAgentState(
            batch=input,
            messages=[],
            classification=None,
            processing_time=0.0,
            model_used=settings.OPENAI_DEFAULT_MODEL,
            retry_count=0,
            error=None,
        )

        start_time = time.time()

        try:
            graph = self.create_graph()
            events = graph.stream(state, stream_mode="values")

            # Consume all events from the stream
            [event for event in events]

            state["processing_time"] = time.time() - start_time

        except Exception as e:
            logger.error(
                f"Error during batch processing for alumni {input.alumni_id}: {str(e)}",
                exc_info=True,
            )
            raise


seniority_agent = SeniorityAgent()
