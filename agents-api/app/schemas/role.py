from typing import Optional

from fastapi import Query
from pydantic import BaseModel, Field


class RoleResolveLocationParams(BaseModel):
    role_ids: Optional[str] = Field(
        Query(None, description="Comma-separated list of role IDs to update")
    )  # noqa: E501
