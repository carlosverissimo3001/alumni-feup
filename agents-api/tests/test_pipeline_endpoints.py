"""The pipeline status and control API (CAR-159).

Endpoints take their session via `Depends(get_db)` so these tests can override
it with the transactional `db` fixture. Opening a session inside the handler
instead would write on a separate connection, outside the fixture's transaction,
and leave rows behind in the test database.
"""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.db.models import PipelineTask
from app.db.session import get_db
from app.main import app
from app.pipeline.runs import create_run, ensure_stages
from app.pipeline.stages import (
    PipelineEntityType,
    PipelineKind,
    PipelineRunStatus,
    PipelineStageName,
    PipelineTaskStatus,
)

HEADERS = {"X-API-Key": "test-secret"}


@pytest.fixture
def client(db, monkeypatch):
    from app.pipeline import runs
    from app.tasks.queue import task_queue

    app.dependency_overrides[get_db] = lambda: db

    enqueued = []

    async def fake_enqueue(task, **kwargs):
        enqueued.append((task, kwargs))
        return "job-id"

    monkeypatch.setattr(task_queue, "enqueue", fake_enqueue)

    # Patched on app.pipeline.runs, not app.pipeline.control: runs.py binds
    # these names at import, so patching the source module leaves its reference
    # pointing at the real function and the test opens a Redis connection.
    monkeypatch.setattr(runs, "request_cancel", lambda run_id, client=None: None)
    monkeypatch.setattr(runs, "clear_cancel", lambda run_id, client=None: None)

    # Deliberately not `with TestClient(app)`: the context manager runs the
    # lifespan, which opens a real arq pool against REDIS_URL and hangs the
    # suite when nothing is listening. Tests want the routes, not the app's
    # startup side effects.
    test_client = TestClient(app)
    test_client.enqueued = enqueued
    yield test_client

    app.dependency_overrides.clear()


def _seed_run(db, status=PipelineRunStatus.RUNNING, kind=PipelineKind.REFRESH_EXISTING):
    run = create_run(db, kind=kind)
    db.flush()
    run.status = status
    ensure_stages(db, run)
    db.flush()
    return run


def _seed_tasks(db, run, stage_name, entities):
    from app.pipeline.executor import materialize_tasks
    from app.pipeline.runs import stage_row

    stage = stage_row(db, run, stage_name)
    materialize_tasks(db, run, stage, list(entities), PipelineEntityType.ALUMNI)
    db.flush()
    return stage


class TestAuth:
    def test_rejects_a_request_without_the_api_key(self, client, db):
        assert client.get("/api/pipelines/runs").status_code == 401


class TestListRuns:
    def test_returns_runs_newest_first(self, client, db):
        older = _seed_run(db)
        newer = _seed_run(db)
        older.created_at = datetime(2026, 1, 1)
        newer.created_at = datetime(2026, 6, 1)
        db.flush()

        body = client.get("/api/pipelines/runs", params={"limit": 100}, headers=HEADERS).json()

        ids = [item["id"] for item in body["items"]]
        assert ids.index(newer.id) < ids.index(older.id)

    def test_filters_by_status(self, client, db):
        running = _seed_run(db, status=PipelineRunStatus.RUNNING)
        _seed_run(db, status=PipelineRunStatus.COMPLETED)

        body = client.get(
            "/api/pipelines/runs", params={"status": "RUNNING"}, headers=HEADERS
        ).json()

        assert [item["id"] for item in body["items"]] == [running.id]

    def test_pages_with_a_cursor(self, client, db):
        seeded = []
        for offset in range(5):
            run = _seed_run(db)
            run.created_at = datetime(2026, 6, 1) + timedelta(minutes=offset)
            seeded.append(run)
        db.flush()

        first = client.get("/api/pipelines/runs", params={"limit": 2}, headers=HEADERS).json()
        assert len(first["items"]) == 2
        assert first["next_cursor"]

        second = client.get(
            "/api/pipelines/runs",
            params={"limit": 2, "cursor": first["next_cursor"]},
            headers=HEADERS,
        ).json()

        # A cursor that overlapped or skipped would show up as a repeated id.
        first_ids = {item["id"] for item in first["items"]}
        second_ids = {item["id"] for item in second["items"]}
        assert first_ids.isdisjoint(second_ids)

    def test_the_last_page_has_no_cursor(self, client, db):
        _seed_run(db)

        body = client.get("/api/pipelines/runs", params={"limit": 50}, headers=HEADERS).json()

        assert body["next_cursor"] is None

    def test_a_malformed_cursor_is_a_client_error(self, client, db):
        response = client.get(
            "/api/pipelines/runs", params={"cursor": "not-a-cursor!!"}, headers=HEADERS
        )
        assert response.status_code == 400


class TestRunDetail:
    def test_includes_every_stage(self, client, db):
        run = _seed_run(db)

        body = client.get(f"/api/pipelines/runs/{run.id}", headers=HEADERS).json()

        assert [stage["stage"] for stage in body["stages"]] == [
            "PLAN",
            "LINKEDIN",
            "COMPANY",
            "CLASSIFY_ROLES",
            "SENIORITY",
            "LOCATION",
        ]

    def test_reports_task_counts(self, client, db):
        run = _seed_run(db)
        stage = _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a", "b", "c"])
        db.query(PipelineTask).filter(
            PipelineTask.stage_id == stage.id, PipelineTask.entity_id == "a"
        ).one().status = PipelineTaskStatus.FAILED
        db.flush()

        body = client.get(f"/api/pipelines/runs/{run.id}", headers=HEADERS).json()

        assert body["counts"]["total"] == 3
        assert body["counts"]["failed"] == 1

    def test_unknown_run_is_a_404(self, client, db):
        response = client.get(
            "/api/pipelines/runs/00000000-0000-0000-0000-000000000000", headers=HEADERS
        )
        assert response.status_code == 404


class TestTaskList:
    def test_filters_by_status(self, client, db):
        run = _seed_run(db)
        stage = _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a", "b"])
        db.query(PipelineTask).filter(
            PipelineTask.stage_id == stage.id, PipelineTask.entity_id == "a"
        ).one().status = PipelineTaskStatus.FAILED
        db.flush()

        body = client.get(
            f"/api/pipelines/runs/{run.id}/tasks",
            params={"status": "FAILED"},
            headers=HEADERS,
        ).json()

        assert [item["entity_id"] for item in body["items"]] == ["a"]

    def test_filters_by_stage(self, client, db):
        run = _seed_run(db)
        _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a"])
        _seed_tasks(db, run, PipelineStageName.SENIORITY, ["b"])

        body = client.get(
            f"/api/pipelines/runs/{run.id}/tasks",
            params={"stage": "SENIORITY"},
            headers=HEADERS,
        ).json()

        assert [item["entity_id"] for item in body["items"]] == ["b"]

    def test_exposes_the_error_so_a_failure_can_be_diagnosed(self, client, db):
        run = _seed_run(db)
        stage = _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a"])
        task = db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).one()
        task.status = PipelineTaskStatus.FAILED
        task.error = "RuntimeError: provider blew up"
        db.flush()

        body = client.get(f"/api/pipelines/runs/{run.id}/tasks", headers=HEADERS).json()

        assert body["items"][0]["error"] == "RuntimeError: provider blew up"


class TestRetry:
    def test_requeues_only_failed_tasks(self, client, db):
        run = _seed_run(db)
        stage = _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a", "b", "c"])
        rows = {
            row.entity_id: row
            for row in db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all()
        }
        rows["a"].status = PipelineTaskStatus.SUCCEEDED
        rows["b"].status = PipelineTaskStatus.FAILED
        rows["c"].status = PipelineTaskStatus.SKIPPED
        db.flush()

        client.post(f"/api/pipelines/runs/{run.id}/retry", headers=HEADERS)

        after = {
            row.entity_id: row.status
            for row in db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all()
        }
        assert after["b"] is PipelineTaskStatus.QUEUED
        # Succeeded work must never be redone - that is the double-spend this
        # whole endpoint exists to avoid.
        assert after["a"] is PipelineTaskStatus.SUCCEEDED
        assert after["c"] is PipelineTaskStatus.SKIPPED

    def test_enqueues_the_earliest_stage_holding_a_failure(self, client, db):
        run = _seed_run(db)
        late = _seed_tasks(db, run, PipelineStageName.SENIORITY, ["b"])
        early = _seed_tasks(db, run, PipelineStageName.COMPANY, ["a"])
        for stage in (early, late):
            for row in db.query(PipelineTask).filter(PipelineTask.stage_id == stage.id).all():
                row.status = PipelineTaskStatus.FAILED
        db.flush()

        client.post(f"/api/pipelines/runs/{run.id}/retry", headers=HEADERS)

        assert client.enqueued == [("run_stage", {"run_id": run.id, "stage": "COMPANY"})]

    def test_a_run_with_no_failures_enqueues_nothing(self, client, db):
        run = _seed_run(db)
        stage = _seed_tasks(db, run, PipelineStageName.CLASSIFY_ROLES, ["a"])
        db.query(PipelineTask).filter(
            PipelineTask.stage_id == stage.id
        ).one().status = PipelineTaskStatus.SUCCEEDED
        db.flush()

        response = client.post(f"/api/pipelines/runs/{run.id}/retry", headers=HEADERS)

        assert response.json()["enqueued_stage"] is None
        assert client.enqueued == []


class TestResumeAndCancel:
    def test_resume_reopens_from_the_named_stage(self, client, db):
        run = _seed_run(db)

        response = client.post(
            f"/api/pipelines/runs/{run.id}/resume",
            params={"from_stage": "COMPANY"},
            headers=HEADERS,
        )

        assert response.status_code == 202
        assert client.enqueued == [("run_stage", {"run_id": run.id, "stage": "COMPANY"})]

    def test_resume_requires_a_stage(self, client, db):
        run = _seed_run(db)
        response = client.post(f"/api/pipelines/runs/{run.id}/resume", headers=HEADERS)
        assert response.status_code == 422

    def test_cancel_marks_the_run_cancelled(self, client, db):
        run = _seed_run(db)

        response = client.post(f"/api/pipelines/runs/{run.id}/cancel", headers=HEADERS)

        assert response.status_code == 202
        assert run.status is PipelineRunStatus.CANCELLED


class TestCreateRun:
    def test_creates_a_run_and_enqueues_the_first_stage(self, client, db):
        response = client.post(
            "/api/pipelines/REFRESH_EXISTING/runs",
            json={"alumni_ids": "a,b"},
            headers=HEADERS,
        )

        assert response.status_code == 202
        run_id = response.json()["run_id"]
        assert client.enqueued == [("run_stage", {"run_id": run_id, "stage": "PLAN"})]

    def test_records_the_params_on_the_run(self, client, db):
        from app.db.models import PipelineRun

        response = client.post(
            "/api/pipelines/REFRESH_EXISTING/runs",
            json={"alumni_ids": "a,b", "failure_threshold": 0.5},
            headers=HEADERS,
        )

        run = db.get(PipelineRun, response.json()["run_id"])
        assert run.params["alumni_ids"] == "a,b"
        assert run.params["failure_threshold"] == 0.5

    def test_rejects_an_unknown_kind(self, client, db):
        assert (
            client.post("/api/pipelines/NONSENSE/runs", json={}, headers=HEADERS).status_code == 422
        )


class TestOpenAPIContract:
    def test_every_pipeline_response_has_a_schema(self, client):
        """Acceptance criterion 2, and the thing CAR-162's SDK depends on.

        An endpoint added without a response_model produces a 2xx with no
        schema, which generates an `any`-typed client method and is invisible
        until someone tries to use it.
        """
        spec = client.get("/openapi.json", headers=HEADERS).json()

        untyped = []
        for path, operations in spec["paths"].items():
            if not path.startswith("/api/pipelines"):
                continue
            for method, operation in operations.items():
                for code, response in operation.get("responses", {}).items():
                    if not code.startswith("2"):
                        continue
                    schema = (
                        response.get("content", {}).get("application/json", {}).get("schema", {})
                    )
                    if not schema.get("$ref") and not schema.get("items"):
                        untyped.append(f"{method.upper()} {path} -> {code}")

        assert untyped == []
