"""The cancellation flag.

Kept in Redis rather than read from `pipeline_run.status`: the executor checks
it once per chunk, and a Postgres read on that path buys nothing over a key
lookup. The run's own status is still updated when the executor observes the
flag, so the tables remain the durable record.
"""

import logging
from typing import Awaitable, Callable, Optional

from redis import Redis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Long enough to outlive any run (the worker's job_timeout is six hours), short
# enough that the keys do not accumulate. Run ids are never reused, so nothing
# would otherwise clean them up.
CANCEL_KEY_TTL = 60 * 60 * 24


def cancel_key(run_id: str) -> str:
    return f"pipeline:cancel:{run_id}"


def _client(client: Optional[Redis]) -> Redis:
    return client if client is not None else Redis.from_url(settings.REDIS_URL)


def request_cancel(run_id: str, client: Optional[Redis] = None) -> None:
    _client(client).setex(cancel_key(run_id), CANCEL_KEY_TTL, "1")
    logger.info("Cancellation requested for run %s", run_id)


def is_cancelled(run_id: str, client: Optional[Redis] = None) -> bool:
    return bool(_client(client).exists(cancel_key(run_id)))


def clear_cancel(run_id: str, client: Optional[Redis] = None) -> None:
    _client(client).delete(cancel_key(run_id))


def cancel_checker(
    run_id: str, client: Optional[Redis] = None
) -> Callable[[], Awaitable[bool]]:
    """An `is_cancelled` callable in the shape `execute_stage` expects.

    Reads on every call rather than closing over a value, so a cancel arriving
    mid-stage is seen at the next chunk boundary.
    """
    resolved = _client(client)

    async def check() -> bool:
        return is_cancelled(run_id, resolved)

    return check
