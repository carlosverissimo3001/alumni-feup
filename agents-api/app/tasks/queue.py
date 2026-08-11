"""Connection handling for the arq task queue.

FastAPI's BackgroundTasks are in-process: a restart mid-batch loses every
pending item with no record it was ever queued. arq keeps the queue in Redis,
so work survives a deploy or a crash.

arq is the executor only. The authoritative record of what a run did lives in
the PipelineRun / PipelineStage / PipelineTask tables, because the admin UI and
the NestJS API need to query it. Keeping run state in both places would mean
two sources of truth that can disagree.
"""

import logging
from typing import Optional

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.core.config import settings

logger = logging.getLogger(__name__)


def redis_settings() -> RedisSettings:
    """arq's connection settings, derived from the same REDIS_URL as the rest."""
    return RedisSettings.from_dsn(settings.REDIS_URL)


class QueueUnavailable(RuntimeError):
    """Raised when something tries to enqueue before the pool is ready."""


class TaskQueue:
    """Holds the arq pool for the lifetime of the application.

    A single pool rather than a connection per enqueue: creating one per request
    is the same mistake as the module-level database session, only in Redis.
    """

    def __init__(self) -> None:
        self._pool: Optional[ArqRedis] = None

    async def connect(self) -> None:
        if self._pool is not None:
            return
        self._pool = await create_pool(redis_settings())
        logger.info("Task queue connected")

    async def disconnect(self) -> None:
        if self._pool is None:
            return
        await self._pool.aclose()
        self._pool = None
        logger.info("Task queue disconnected")

    @property
    def pool(self) -> ArqRedis:
        if self._pool is None:
            raise QueueUnavailable(
                "The task queue is not connected. It is opened during application "
                "startup; a caller reaching this either bypassed the lifespan or is "
                "running outside the app."
            )
        return self._pool

    async def enqueue(self, task: str, **kwargs) -> Optional[str]:
        """Queue a task and return its arq job id.

        The id is returned for logging and correlation only. Progress is read
        from the pipeline tables, not from arq - arq forgets a job shortly after
        it finishes, and the admin UI needs history.
        """
        job = await self.pool.enqueue_job(task, **kwargs)
        if job is None:
            # arq returns None when a job with the same id already exists, which
            # is how deduplication surfaces when _job_id is passed.
            logger.info(f"Task {task} not queued - a job with the same id already exists")
            return None
        logger.info(f"Queued {task} as {job.job_id}")
        return job.job_id


task_queue = TaskQueue()
