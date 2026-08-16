"""The cancellation flag (CAR-157).

Hermetic: the Redis client is injected, following the pattern `rate_limiter`
already uses. What matters is the protocol - a key set, seen, and cleared - not
that Redis itself works.
"""

import pytest

from app.pipeline.control import (
    CANCEL_KEY_TTL,
    cancel_checker,
    clear_cancel,
    is_cancelled,
    request_cancel,
)


class FakeRedis:
    """Just enough of the client surface, recording what it was asked to do."""

    def __init__(self):
        self.store = {}
        self.expiries = {}

    def setex(self, key, ttl, value):
        self.store[key] = value
        self.expiries[key] = ttl

    def exists(self, key):
        return 1 if key in self.store else 0

    def delete(self, key):
        self.store.pop(key, None)
        self.expiries.pop(key, None)


@pytest.fixture
def client():
    return FakeRedis()


class TestCancelFlag:
    def test_a_run_is_not_cancelled_by_default(self, client):
        assert is_cancelled("run-1", client) is False

    def test_requesting_cancel_makes_it_visible(self, client):
        request_cancel("run-1", client)
        assert is_cancelled("run-1", client) is True

    def test_cancelling_one_run_does_not_cancel_another(self, client):
        request_cancel("run-1", client)
        assert is_cancelled("run-2", client) is False

    def test_the_flag_expires(self, client):
        # Without a TTL every cancelled run leaves a key behind forever, and
        # a run id is never reused to clean it up.
        request_cancel("run-1", client)
        assert client.expiries["pipeline:cancel:run-1"] == CANCEL_KEY_TTL

    def test_clearing_lets_the_run_be_restarted(self, client):
        # A resume after a cancel has to clear the flag, or the resumed run
        # stops at its first chunk for a cancellation that already happened.
        request_cancel("run-1", client)
        clear_cancel("run-1", client)
        assert is_cancelled("run-1", client) is False


class TestCancelChecker:
    async def test_reports_the_current_flag_each_time_it_is_called(self, client):
        # The executor calls this once per chunk, so it has to observe a cancel
        # that arrives mid-stage rather than capturing the value up front.
        check = cancel_checker("run-1", client)

        assert await check() is False
        request_cancel("run-1", client)
        assert await check() is True
