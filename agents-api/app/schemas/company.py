from typing import Optional

from fastapi import Query
from pydantic import BaseModel, Field


class CompanyUpdateParams(BaseModel):
    company_ids: Optional[str] = Field(Query(None, description="Comma-separated list of company IDs to update"))  # noqa: E501
