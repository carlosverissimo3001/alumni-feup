"""Tests for the arq task queue (CAR-113).

The failure this file mostly exists to prevent: `enqueue("clasify_alumni_roles")`
is accepted by arq without complaint and only fails when a worker picks the job
up - by which point the request has long returned 202 and nobody is watching.
Cross-checking the strings in the endpoints against the registered tasks turns
that into a CI failure.
"""

import ast
import pathlib

import pytest

from app.tasks.pipeline import TASK_NAMES, TASKS
from app.tasks.queue import QueueUnavailable, TaskQueue

ENDPOINTS = pathlib.Path(__file__).resolve().parents[1] / "app" / "api" / "endpoints"


def _enqueued_names() -> set[str]:
    """Every literal passed as the first argument to task_queue.enqueue()."""
    names: set[str] = set()
    for path in ENDPOINTS.glob("*.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            func = node.func
            if isinstance(func, ast.Attribute) and func.attr == "enqueue" and node.args:
                first = node.args[0]
                if isinstance(first, ast.Constant) and isinstance(first.value, str):
                    names.add(first.value)
    return names


# --- registration -------------------------------------------------------------


def test_endpoints_only_enqueue_registered_tasks():
    """A typo here is invisible until a worker fails on the job."""
    enqueued = _enqueued_names()
    assert enqueued, "found no enqueue() calls - has the helper been renamed?"

    unknown = enqueued - TASK_NAMES
    assert unknown == set(), (
        f"These task names are enqueued but not registered with the worker: "
        f"{sorted(unknown)}. Registered: {sorted(TASK_NAMES)}"
    )


def test_every_registered_task_is_reachable():
    """A task nobody enqueues is either dead code or a missing call site."""
    unused = TASK_NAMES - _enqueued_names()
    assert unused == set(), (
        f"These tasks are registered but never enqueued: {sorted(unused)}. "
        "Either wire them up or remove them."
    )


def test_task_names_are_unique():
    assert len(TASKS) == len(TASK_NAMES)


def test_tasks_accept_the_arq_context_first():
    """arq calls every task as fn(ctx, **kwargs); a task missing it fails at
    execution, not at registration.
    """
    import inspect

    for task in TASKS:
        first = next(iter(inspect.signature(task).parameters))
        assert first == "ctx", f"{task.__name__} must take ctx as its first parameter"


# --- connection handling ------------------------------------------------------


async def test_enqueue_before_connect_is_a_clear_error():
    """Better than an AttributeError on None several frames down."""
    queue = TaskQueue()
    with pytest.raises(QueueUnavailable, match="not connected"):
        await queue.enqueue("update_companies")


async def test_disconnect_without_connect_is_harmless():
    """Shutdown runs even when startup failed part-way."""
    await TaskQueue().disconnect()


async def test_connect_is_idempotent(monkeypatch):
    """Lifespan can run twice in tests and reloaders; a second pool would leak."""
    created = []

    async def fake_create_pool(_settings):
        created.append(1)
        return object()

    monkeypatch.setattr("app.tasks.queue.create_pool", fake_create_pool)

    queue = TaskQueue()
    await queue.connect()
    await queue.connect()

    assert len(created) == 1


async def test_enqueue_returns_none_when_arq_rejects_a_duplicate(monkeypatch):
    """arq returns None when a job id already exists. That is deduplication
    working, not an error, so it must not raise.
    """

    class FakePool:
        async def enqueue_job(self, *args, **kwargs):
            return None

    queue = TaskQueue()
    queue._pool = FakePool()

    assert await queue.enqueue("update_companies") is None
