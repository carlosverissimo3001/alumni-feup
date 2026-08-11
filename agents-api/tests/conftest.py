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

# CI provides TEST_DATABASE_URL; locally this is docker-compose-dev.yml.
# The application's own engine is pointed at it too, so tests that exercise
# app.db.session (rather than the `db` fixture) reach the same database.
# Nothing connects at import - SQLAlchemy engines are lazy - so the hermetic
# tests are unaffected.
_TEST_DATABASE_URL = os.environ.setdefault(
    "TEST_DATABASE_URL", "postgresql://postgres:secret@localhost:5434/postgres"
)
os.environ["DATABASE_URL"] = _TEST_DATABASE_URL
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
from sqlalchemy.pool import NullPool  # noqa: E402

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


# --- database fixtures --------------------------------------------------------
#
# Opt-in. Most of the suite never touches a database and stays hermetic; these
# fixtures exist for the code where the database *is* the behaviour under test,
# starting with session scoping (CAR-115).
#
# Loopback is permitted by the network guard above, so a local container or a CI
# service container both work.

# CI provides this; locally it defaults to docker-compose-dev.yml.
TEST_DATABASE_URL = _TEST_DATABASE_URL


@pytest.fixture(scope="session")
def db_engine():
    """Engine for the test database, or skip if it is not reachable.

    Skipping locally keeps `pytest` working for contributors without Docker.
    In CI the service container is guaranteed, so an unreachable database is a
    real failure - silently skipping there would report green on tests that
    never ran.
    """
    from sqlalchemy import create_engine, text

    engine = create_engine(TEST_DATABASE_URL, poolclass=NullPool)
    try:
        with engine.connect() as conn:
            conn.execute(text("select 1 from pipeline_run limit 0"))
    except Exception as exc:  # noqa: BLE001
        reason = (
            f"Test database unavailable or schema not applied at "
            f"{TEST_DATABASE_URL.rsplit('@', 1)[-1]}: {type(exc).__name__}. "
            "Start it with `docker compose -f docker-compose-dev.yml up -d` and apply "
            "the Prisma migrations."
        )
        if os.environ.get("CI"):
            pytest.fail(reason)
        pytest.skip(reason)

    yield engine
    engine.dispose()


@pytest.fixture
def db(db_engine):
    """A session wrapped in a transaction that is always rolled back.

    Isolation without truncating: the outer transaction is never committed, so
    a test can commit freely and still leave the database untouched. That
    matters here because the local database holds a copy of production.
    """
    from sqlalchemy.orm import sessionmaker

    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    try:
        yield session
    finally:
        session.close()
        # A test that provoked an IntegrityError has already left the
        # transaction aborted, so rolling back again warns. Only roll back what
        # is still live.
        if transaction.is_active:
            transaction.rollback()
        connection.close()
