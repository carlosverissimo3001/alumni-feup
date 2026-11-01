"""LOCATION's StageSpec registration (CAR-474 follow-up).

LOCATION moved from an untracked, fire-and-forget background task nested
inside LINKEDIN to its own tracked pipeline stage. This confirms it is
actually registered - spec_for returning None for it would mean run_stage
silently marks it SKIPPED again, as it does for any stage absent from
STAGES (see app/tasks/pipeline.py's spec_for(stage_name) is None branch).
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
