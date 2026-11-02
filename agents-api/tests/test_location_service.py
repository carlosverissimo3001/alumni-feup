"""resolve_role_location_for_alumni must never fall through to a database-wide
sweep for an alumnus who simply has no roles yet.

request_role_location treats a falsy `role_ids` as "no filter given, resolve
every role in the database" (used by the deliberate full-refresh admin path).
An alumnus with zero roles previously produced role_ids="" here, which is
also falsy, and silently triggered that same database-wide fallback instead
of doing nothing.
"""

from contextlib import contextmanager

from app.services.location import location_service


@contextmanager
def _fake_session_scope():
    yield None


class _Call:
    def __init__(self):
        self.params = None

    async def __call__(self, params):
        self.params = params


async def test_an_alumnus_with_no_roles_never_triggers_the_database_wide_fallback(
    monkeypatch,
):
    monkeypatch.setattr("app.services.location.session_scope", _fake_session_scope)
    monkeypatch.setattr("app.services.location.get_roles_by_alumni_id", lambda alumni_id, db: [])

    recorded = _Call()
    monkeypatch.setattr(location_service, "request_role_location", recorded)

    await location_service.resolve_role_location_for_alumni("alumni-with-no-roles")

    assert recorded.params is None


async def test_an_alumnus_with_roles_scopes_the_request_to_just_those_roles(monkeypatch):
    monkeypatch.setattr("app.services.location.session_scope", _fake_session_scope)

    class FakeRole:
        def __init__(self, id):
            self.id = id

    monkeypatch.setattr(
        "app.services.location.get_roles_by_alumni_id",
        lambda alumni_id, db: [FakeRole("role-1"), FakeRole("role-2")],
    )

    recorded = _Call()
    monkeypatch.setattr(location_service, "request_role_location", recorded)

    await location_service.resolve_role_location_for_alumni("alumni-with-roles")

    assert recorded.params.role_ids == "role-1,role-2"
