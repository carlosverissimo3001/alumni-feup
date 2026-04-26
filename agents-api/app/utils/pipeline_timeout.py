"""Task-level timeout helper for agent pipeline steps.

A hung external HTTP/LLM call can stall a whole batch even when the underlying
httpx clients have read timeouts, because retries and backoffs stack. Wrapping
each pipeline step in `asyncio.wait_for()` puts a hard ceiling on how long any
single step is allowed to run.
"""

import asyncio
import logging
from typing import Awaitable, TypeVar

logger = logging.getLogger(__name__)

# 300s = ~5 min. Generous enough to allow the underlying httpx retry cycle
# (3 attempts * 60s read timeout + 1-10s exponential backoff) to exhaust
# without prematurely cancelling slow-but-progressing batches.
DEFAULT_PIPELINE_STEP_TIMEOUT = 300.0

T = TypeVar("T")


async def with_pipeline_timeout(
    coro: Awaitable[T],
    *,
    step: str,
    seconds: float = DEFAULT_PIPELINE_STEP_TIMEOUT,
) -> T:
    """Run a coroutine under a task-level timeout.

    Re-raises asyncio.TimeoutError after logging context. Callers in the
    batch path should catch and mark the corresponding BatchJobItem as
    failed with reason="timeout" once that table exists (CAR-114).
    """
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        logger.exception(
            f"Pipeline step '{step}' timed out after {seconds}s",
            extra={"step": step, "timeout_seconds": seconds},
        )
        raise
