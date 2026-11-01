"""LOCATION and SENIORITY's conversion to tracked pipeline stages.

Mirrors how LINKEDIN and CLASSIFY_ROLES are covered: spec_for must return a
real StageSpec (not the SKIPPED fallback run_stage uses for an unconverted
stage), wired to the shared alumni resolver and a handler that drives the
relevant service. LOCATION moved from an untracked, fire-and-forget
background task nested inside LINKEDIN; SENIORITY moved from one nested
inside CLASSIFY_ROLES.
"""

from app.pipeline.executor import StageSpec
from app.pipeline.registry import _resolve_alumni, spec_for
from app.pipeline.stages import PipelineEntityType, PipelineStageName


class TestLocationStageSpec:
    def test_location_has_a_real_spec(self):
        spec = spec_for(PipelineStageName.LOCATION)

        assert spec is not None
        assert isinstance(spec, StageSpec)

    def test_location_operates_per_alumnus(self):
        spec = spec_for(PipelineStageName.LOCATION)

        assert spec.entity_type is PipelineEntityType.ALUMNI
        # Same resolver as LINKEDIN/CLASSIFY_ROLES - LOCATION scopes to a run's
        # alumni_ids exactly the way they do.
        assert spec.resolve is _resolve_alumni

    async def test_location_handle_delegates_to_the_location_service(self, monkeypatch):
        from app.services import location as location_module

        calls = []

        async def fake_resolve(alumni_id):
            calls.append(alumni_id)

        monkeypatch.setattr(
            location_module.location_service, "resolve_role_location_for_alumni", fake_resolve
        )

        spec = spec_for(PipelineStageName.LOCATION)
        await spec.handle("alumni-1")

        assert calls == ["alumni-1"]


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
