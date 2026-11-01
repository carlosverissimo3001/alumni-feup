"""skip_followup_classification/skip_followup_location on process_profile_data
and extract_profile_data (CAR-474).

extract_profile_data fires job_classification_service.request_alumni_classification
and location_service.resolve_role_location_for_alumni as background fire-and-forget
tasks on every call. Both duplicate explicit work a pipeline run already does for
the same alumni right after its LINKEDIN work (CLASSIFY_ROLES and, once LOCATION
was converted to a tracked stage, LOCATION), so a caller running inside such a
sequence passes skip_followup_classification=True / skip_followup_location=True to
suppress them. The standalone extraction path (the single-alumni manual re-extract
trigger, with no such follow-up) has no reason to pass either flag and must keep
firing both background calls exactly as before.
"""

from app.schemas.linkedin import LinkedInProfileResponse
from app.services import location as location_module
from app.services.linkedin import LinkedInService
from app.services.linkedin import job_classification_service as linkedin_job_classification_service

PROFILE = LinkedInProfileResponse(experiences=[])


def _service(monkeypatch):
    service = LinkedInService()

    async def no_persist(*args, **kwargs):
        return None

    monkeypatch.setattr(service, "_persist_profile_data", no_persist)

    async def no_location(*args, **kwargs):
        return None

    monkeypatch.setattr(
        location_module.location_service, "resolve_role_location_for_alumni", no_location
    )

    return service


async def _classification_calls(monkeypatch):
    calls = []

    async def fake_classify(*args, **kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(
        linkedin_job_classification_service, "request_alumni_classification", fake_classify
    )
    return calls


async def _location_calls(monkeypatch):
    """Like _classification_calls, but tracks location resolution instead.

    Replaces the _service() helper's own no_location no-op with a spy, so
    these tests can tell whether the call actually fired.
    """
    calls = []

    async def fake_resolve(alumni_id):
        calls.append(alumni_id)

    monkeypatch.setattr(
        location_module.location_service, "resolve_role_location_for_alumni", fake_resolve
    )
    return calls


class TestSkipFollowupClassification:
    async def test_pipeline_triggered_call_does_not_fire_classification(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _classification_calls(monkeypatch)

        await service.process_profile_data(PROFILE, "alumni-1", skip_followup_classification=True)
        await service.close()

        assert calls == []

    async def test_standalone_call_keeps_firing_classification(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _classification_calls(monkeypatch)

        # Default behaviour, unchanged: the manual re-extract trigger calls
        # this with no flag at all.
        await service.process_profile_data(PROFILE, "alumni-1")
        await service.close()

        assert len(calls) == 1
        assert calls[0]["params"].alumni_ids == "alumni-1"

    async def test_extract_profile_data_passes_the_flag_through(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _classification_calls(monkeypatch)

        def fake_find_by_id(alumni_id, db):
            class _Alumni:
                linkedin_url = "https://linkedin.com/in/someone"

            return _Alumni()

        monkeypatch.setattr("app.services.linkedin.find_by_id", fake_find_by_id)
        monkeypatch.setattr(
            "app.services.linkedin.session_scope",
            lambda: _NullContext(),
        )
        monkeypatch.setattr(service.client, "set_headers", lambda *a, **k: None)
        monkeypatch.setattr(service.client, "get_json", lambda *a, **k: _RAW_PROFILE)

        await service.extract_profile_data("alumni-1", skip_followup_classification=True)
        await service.close()

        assert calls == []


class TestSkipFollowupLocation:
    async def test_pipeline_triggered_call_does_not_fire_location(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _location_calls(monkeypatch)

        await service.process_profile_data(PROFILE, "alumni-1", skip_followup_location=True)
        await service.close()

        assert calls == []

    async def test_standalone_call_keeps_firing_location(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _location_calls(monkeypatch)

        # Default behaviour, unchanged: the manual re-extract trigger calls
        # this with no flag at all.
        await service.process_profile_data(PROFILE, "alumni-1")
        await service.close()

        assert calls == ["alumni-1"]

    async def test_extract_profile_data_passes_the_flag_through(self, monkeypatch):
        service = _service(monkeypatch)
        calls = await _location_calls(monkeypatch)

        def fake_find_by_id(alumni_id, db):
            class _Alumni:
                linkedin_url = "https://linkedin.com/in/someone"

            return _Alumni()

        monkeypatch.setattr("app.services.linkedin.find_by_id", fake_find_by_id)
        monkeypatch.setattr(
            "app.services.linkedin.session_scope",
            lambda: _NullContext(),
        )
        monkeypatch.setattr(service.client, "set_headers", lambda *a, **k: None)
        monkeypatch.setattr(service.client, "get_json", lambda *a, **k: _RAW_PROFILE)

        await service.extract_profile_data("alumni-1", skip_followup_location=True)
        await service.close()

        assert calls == []


class _NullContext:
    def __enter__(self):
        return None

    def __exit__(self, *exc_info):
        return False


_RAW_PROFILE = {
    "profile_pic_url": None,
    "country": None,
    "country_full_name": None,
    "city": None,
    "experiences": [],
}
