"""Shared fixtures and the network guard.

Environment is set here, at import time, because `app.core.config.Settings`
declares `DATABASE_URL` as required and is evaluated the moment anything under
`app.` is imported. pytest imports conftest before any test module, so this runs
first.

Values are assigned rather than defaulted: a developer with a populated `.env`
would otherwise hand real credentials to the suite, and `load_dotenv()` in
`app.main` pulls that file into the process environment.
"""

import os

os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/agents_test"
os.environ["OPENAI_API_KEY"] = "sk-test-not-a-real-key"
os.environ["REDIS_URL"] = "redis://localhost:6379/15"
os.environ["API_KEY_SECRET"] = "test-secret"
os.environ["ENVIRONMENT"] = "test"

# Every third-party key the app reads, blanked so a misconfigured test cannot
# authenticate against a real service even if it somehow escapes the guard below.
for _key in (
    "ALUMNI_EXTRACT_API_KEY",
    "BRIGHTDATA_API_KEY",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "GEOLOCATION_API_KEY",
):
    os.environ[_key] = ""

import socket  # noqa: E402

import pytest  # noqa: E402

# Loopback stays open so tests can reach a Postgres/Redis service container.
# Everything else is refused.
#
# 0.0.0.0 is deliberately absent: it is the wildcard *bind* address, not a
# loopback one, and nothing connects to it as a destination. A container that
# binds 0.0.0.0 is still reached over 127.0.0.1.
_ALLOWED_HOSTS = frozenset({"127.0.0.1", "::1", "localhost"})

_real_connect = socket.socket.connect
_real_connect_ex = socket.socket.connect_ex
_real_create_connection = socket.create_connection


class NetworkAccessAttempted(RuntimeError):
    """A test tried to open a non-loopback connection."""


def _describe(address: object) -> str:
    if isinstance(address, tuple) and address:
        return f"{address[0]}:{address[1] if len(address) > 1 else '?'}"
    return str(address)


def _is_allowed(address: object) -> bool:
    # AF_UNIX addresses are plain strings and never leave the machine.
    if isinstance(address, (str, bytes)):
        return True
    if isinstance(address, tuple) and address:
        return address[0] in _ALLOWED_HOSTS
    return False


def _refuse(address: object) -> NetworkAccessAttempted:
    return NetworkAccessAttempted(
        f"Blocked outbound connection to {_describe(address)}.\n"
        "Tests must not touch the network — a live LLM or enrichment call is billed "
        "on every CI run. Stub the client, or use the `respx_mock` fixture for httpx.\n"
        "If this is a legitimate local service, add its host to _ALLOWED_HOSTS."
    )


@pytest.fixture(scope="session", autouse=True)
def block_network() -> None:
    """Refuse non-loopback connections for the whole session.

    Enforced rather than documented: the cost of a test quietly calling a paid
    API is real money on every push, and a convention does not stop it.
    """

    def guarded_connect(self, address):  # type: ignore[no-untyped-def]
        if not _is_allowed(address):
            raise _refuse(address)
        return _real_connect(self, address)

    def guarded_connect_ex(self, address):  # type: ignore[no-untyped-def]
        if not _is_allowed(address):
            raise _refuse(address)
        return _real_connect_ex(self, address)

    def guarded_create_connection(address, *args, **kwargs):  # type: ignore[no-untyped-def]
        if not _is_allowed(address):
            raise _refuse(address)
        return _real_create_connection(address, *args, **kwargs)

    socket.socket.connect = guarded_connect
    socket.socket.connect_ex = guarded_connect_ex
    socket.create_connection = guarded_create_connection
    try:
        yield
    finally:
        socket.socket.connect = _real_connect
        socket.socket.connect_ex = _real_connect_ex
        socket.create_connection = _real_create_connection


@pytest.fixture
def allow_loopback_check():
    """Expose the guard's predicate so tests can assert on it directly."""
    return _is_allowed
