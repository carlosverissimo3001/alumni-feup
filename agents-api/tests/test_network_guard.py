"""The guard is the suite's cost control, so it gets its own tests.

If these regress, a test making a paid LLM call would pass silently and bill on
every CI run — the failure this whole arrangement exists to prevent.
"""

import socket

import pytest

from tests.conftest import NetworkAccessAttempted


def test_outbound_connection_is_refused():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    with pytest.raises(NetworkAccessAttempted):
        sock.connect(("api.openai.com", 443))


def test_create_connection_is_refused():
    with pytest.raises(NetworkAccessAttempted):
        socket.create_connection(("huggingface.co", 443))


def test_refusal_names_the_host():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    with pytest.raises(NetworkAccessAttempted, match="api.anthropic.com:443"):
        sock.connect(("api.anthropic.com", 443))


@pytest.mark.parametrize("host", ["127.0.0.1", "localhost", "::1"])
def test_loopback_is_permitted(allow_loopback_check, host):
    """Local Postgres/Redis service containers must stay reachable."""
    assert allow_loopback_check((host, 5432))


def test_unix_sockets_are_permitted(allow_loopback_check):
    assert allow_loopback_check("/var/run/postgresql/.s.PGSQL.5432")


def test_external_host_is_not_permitted(allow_loopback_check):
    assert not allow_loopback_check(("169.254.169.254", 80))
