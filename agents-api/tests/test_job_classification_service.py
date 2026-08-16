"""Error propagation out of the per-entity classification seam (CAR-157).

The executor decides a task FAILED by catching what the handler raises. A
service that logs and swallows makes every task look successful, which quietly
disables the failure threshold and the abort path with it.
"""

import pytest

from app.services.job_classification import job_classification_service


async def test_classify_roles_for_alumni_propagates_failures(monkeypatch):
    def blow_up(alumni_id, db):
        raise RuntimeError("database went away")

    monkeypatch.setattr("app.services.job_classification.get_extended_roles_by_alumni_id", blow_up)

    with pytest.raises(RuntimeError, match="database went away"):
        await job_classification_service.classify_roles_for_alumni("alumni-1")
