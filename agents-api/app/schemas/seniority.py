from typing import List

from langgraph.graph import add_messages
from pydantic import BaseModel
from typing_extensions import Annotated, TypedDict


# Entry point for the seniority agent
# Classifies the seniority of the roles of an alumn
# This is the payload we send on the last edge of the job classification agent
class SeniorityInput(BaseModel):
    alumni_id: str


class RoleSeniorityInput(BaseModel):
    role_id: str
    
    # duration of the role, in natural language
    # e.g. "1 year and 3 months"
    duration: str
    
    # The company of the role
    company: str
    
    # The ESCO level 1 of the role
    esco_l1: str
    # The ESCO level 2 of the role
    esco_l2: str
        

class SeniorityAgentState(TypedDict):
    # The 
    roles: List[RoleSeniorityInput]
    
    
    messages: Annotated[list, add_messages]
    
    processing_time: float
    
    model_used: str
