"""SENIORITY's conversion to a tracked pipeline stage.

Mirrors how LINKEDIN and CLASSIFY_ROLES are covered: spec_for must return a
real StageSpec (not the SKIPPED fallback run_stage uses for an unconverted
stage), wired to the shared alumni resolver and a handler that drives the
seniority service.
"""

from app.pipeline.registry import spec_for
from app.pipeline.stages import PipelineEntityType, PipelineStageName


def test_seniority_has_a_registered_spec():
    spec = spec_for(PipelineStageName.SENIORITY)

    assert spec is not None
    assert spec.entity_type is PipelineEntityType.ALUMNI


async def test_seniority_handler_drives_the_seniority_service(monkeypatch):
    from app.pipeline import registry
    from app.services import seniority as seniority_module

    calls = []

    async def fake_request_alumni_seniority(params):
        calls.append(params)

    monkeypatch.setattr(
        seniority_module.seniority_service,
        "request_alumni_seniority",
        fake_request_alumni_seniority,
    )

    spec = registry.spec_for(PipelineStageName.SENIORITY)
    await spec.handle("alumni-1")

    assert len(calls) == 1
    assert calls[0].alumni_ids == "alumni-1"


async def test_classify_roles_handler_skips_the_followup_seniority_call(monkeypatch):
    """CLASSIFY_ROLES must suppress the service's own internal seniority
    trigger (CAR-474-style), since SENIORITY now runs that explicitly right
    after - otherwise every pipeline run would double its seniority spend."""
    from app.pipeline import registry

    seen = {}

    async def fake_classify_roles_for_alumni(alumni_id, skip_followup_seniority=False):
        seen["alumni_id"] = alumni_id
        seen["skip_followup_seniority"] = skip_followup_seniority

    monkeypatch.setattr(
        "app.services.job_classification.job_classification_service.classify_roles_for_alumni",
        fake_classify_roles_for_alumni,
    )

    spec = registry.spec_for(PipelineStageName.CLASSIFY_ROLES)
    await spec.handle("alumni-1")

    assert seen == {"alumni_id": "alumni-1", "skip_followup_seniority": True}
