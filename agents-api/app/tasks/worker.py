"""arq worker configuration.

Run with:  uv run arq app.tasks.worker.WorkerSettings

A separate process from the web app. That separation is the point: the API can
be redeployed or restarted without dropping work, and the worker can be scaled
or paused independently of serving traffic.
"""

import logging

from app.core.config import settings
from app.tasks.pipeline import TASKS
from app.tasks.queue import redis_settings

logger = logging.getLogger(__name__)


async def startup(ctx) -> None:
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger.info("Worker started")


async def shutdown(ctx) -> None:
    from app.core.service_manager import service_manager

    await service_manager.cleanup()
    logger.info("Worker stopped")


class WorkerSettings:
    functions = TASKS
    redis_settings = redis_settings()
    on_startup = startup
    on_shutdown = shutdown

    # One job at a time per worker. These tasks are batch pipelines that already
    # fan out internally with their own semaphores and token rate limiter;
    # running several concurrently would multiply that concurrency by the worker
    # count and blow through the OpenAI rate limit rather than respecting it.
    max_jobs = 1

    # A full alumni refresh legitimately runs for a long time - request_role_location
    # alone sleeps 60s between batches. The old BackgroundTasks had no timeout at
    # all, so this is a ceiling where there was none, not a new restriction.
    job_timeout = 60 * 60 * 6

    # Retries are for transient failures - a dropped connection, a provider
    # blip. Beyond a few attempts the cause is not transient and retrying just
    # spends money on the same error.
    max_tries = 3

    # Keep finished jobs briefly so a failure is still inspectable in Redis
    # immediately after it happens. Durable history lives in the pipeline
    # tables, not here.
    keep_result = 60 * 60
