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


async def test_classify_roles_for_alumni_threads_skip_followup_seniority(monkeypatch):
    """The pipeline's SENIORITY stage passes skip_followup_seniority=True so
    the agent's own internal seniority trigger does not fire a duplicate;
    this must reach `_process_roles_batch` unchanged."""
    from datetime import datetime

    from app.schemas.job_classification import JobClassificationInput, JobClassificationRoleInput

    role = JobClassificationRoleInput(
        role_id="role-1",
        title="Backend Engineer",
        description=None,
        start_date=datetime(2021, 9, 1),
        end_date=None,
        company_name="Feup Systems",
        industry_name="Software",
        is_promotion=False,
    )

    monkeypatch.setattr(
        "app.services.job_classification.get_extended_roles_by_alumni_id",
        lambda alumni_id, db: JobClassificationInput(alumni_id=alumni_id, roles=[role]),
    )

    seen = {}

    async def fake_process_roles_batch(roles, alumni_id, skip_followup_seniority=False):
        seen["roles"] = roles
        seen["alumni_id"] = alumni_id
        seen["skip_followup_seniority"] = skip_followup_seniority

    monkeypatch.setattr(
        "app.services.job_classification.job_classification_agent._process_roles_batch",
        fake_process_roles_batch,
    )

    await job_classification_service.classify_roles_for_alumni(
        "alumni-1", skip_followup_seniority=True
    )

    assert seen["roles"] == [role]
    assert seen["alumni_id"] == "alumni-1"
    assert seen["skip_followup_seniority"] is True
