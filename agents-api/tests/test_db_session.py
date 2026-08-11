"""Tests for session lifecycle (CAR-115).

The bug these exist to prevent: a single `db = next(get_db())` evaluated at
import time and shared by every request, agent and background task for the
lifetime of the process. That session is never closed, its identity map grows
without bound, it is not safe under concurrency, and one failed transaction
leaves it unusable for everything else.

The failure mode is intermittent rather than immediate, which is exactly why it
needs tests rather than a smoke check.
"""

import importlib
import pkgutil

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session

import app as app_package
from app.db.session import session_scope


class Boom(Exception):
    pass


# --- session_scope ------------------------------------------------------------


def test_yields_a_usable_session(db_engine):
    with session_scope() as session:
        assert isinstance(session, Session)
        assert session.execute(text("select 1")).scalar() == 1


def test_closes_the_session_on_exit(db_engine):
    with session_scope() as session:
        session.execute(text("select 1"))

    # A closed session has released its connection back to the pool.
    assert not session.in_transaction()


def test_each_scope_gets_its_own_session(db_engine):
    with session_scope() as first:
        with session_scope() as second:
            assert first is not second


def test_an_exception_rolls_back_and_propagates(db_engine):
    """A failed unit of work must not leave a half-applied transaction behind,
    and must not swallow the error that caused it.
    """
    with pytest.raises(Boom):
        with session_scope() as session:
            session.execute(text("create temporary table car115_probe (id int)"))
            raise Boom()

    # The temporary table went with the rolled-back transaction.
    with session_scope() as session:
        exists = session.execute(text("select to_regclass('car115_probe') is not null")).scalar()
        assert exists is False


def test_a_failed_scope_does_not_poison_the_next_one(db_engine):
    """The core problem with a shared module-level session: one bad transaction
    left it aborted, so every later caller failed too with
    "current transaction is aborted, commands ignored".
    """
    with pytest.raises(DBAPIError):
        with session_scope() as session:
            session.execute(text("select 1 / 0"))

    with session_scope() as session:
        assert session.execute(text("select 1")).scalar() == 1


# --- no module-level sessions -------------------------------------------------


def _app_modules():
    """Every module under `app`, so a new one cannot quietly reintroduce this."""
    for info in pkgutil.walk_packages(app_package.__path__, prefix="app."):
        yield info.name


def test_no_module_holds_a_session_at_import_time():
    """This is the acceptance criterion for CAR-115.

    Importing a module must not open a database session. Any module-level
    `db = next(get_db())` shows up here as an attribute that is a live Session.
    """
    offenders = []
    for name in _app_modules():
        try:
            module = importlib.import_module(name)
        except Exception:  # noqa: BLE001 - import errors are other tests' problem
            continue
        for attr in vars(module).values():
            if isinstance(attr, Session):
                offenders.append(name)
                break

    assert offenders == [], (
        "These modules open a database session at import time, which is shared "
        "process-wide and never closed: " + ", ".join(sorted(offenders))
    )
