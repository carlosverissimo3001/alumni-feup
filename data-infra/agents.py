from typing import List
from typing_extensions import TypedDict
from langchain_ollama import ChatOllama
from pydantic import BaseModel
from db.connection import DatabaseConnection
from db.models import EscoClassification


class EscoClassificationResponse(BaseModel):
    id: str
    level: int
    code: str
    title_en: str
    definition: str
    tasks_include: str
    included_occupations: str
    excluded_occupations: str
    notes: str | None = None


def fetch_esco_classifications() -> List[EscoClassificationResponse]:
    db = DatabaseConnection()
    with db.get_session() as session:
        return session.query(EscoClassification).limit(10).all()

def validate_user(user_id: int, addresses: List[str]) -> bool:
    """
    Validate user using historical addresses

    Args:
        user_id: int
        addresses: List[str]

    Returns:
        bool
    """
    return True

llm = ChatOllama(model="llama3-groq-tool-use", temperature=0).bind_tools(
    [validate_user]
)

""" result = llm.invoke(
    "How would you classify the foolwing LinkedIn description into an ESCO classification? \n\n Description: \
        'Working as a Tech Consultant at Deloitte, I performed several tasks for different projects including: \
        Migrated a complex Oracle Database centered system to Postgre SQL. From the data itself to every \
        component from various schemas, including Packages and Procedures, we managed to automate the \
        most arduous tasks from migrating these. Made part of a team of developers that migrated one of \
        the largest Hadoop clusters in Europe to AWS. This cluster integrated 55 Data lakes, 800 Ingest \
        flows, 800 acceptance jobs, 80 master projects, and 50 export jobs. This project enabled me to \
        put to the test skills in technologies such as Apache Nifi in ingestion; Terraform, Gitlab's \
        CI/CD and AWS CloudWatch for Data Lifecycle Management; EKS, EMR, EMR Studio Spark and Python for \
        data analytics; AWS S3 and HDFS for data storage among others.'"
) """

result = llm.invoke(
    "Could you validate the user 123? They have lived at 123 Fake St in Boston MA and 234 Pretend Ave in San Francisco CA"
)

result.tool_calls
