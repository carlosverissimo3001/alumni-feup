import asyncio
import logging
import time
from typing import Optional

from redis import Redis
from tenacity import (
    before_sleep_log,
    retry,
    stop_after_attempt,
    wait_random_exponential,
)

logger = logging.getLogger(__name__)


class TokenRateLimiter:
    """Asynchronous token-based rate limiter with Redis-based distributed locking."""

    def __init__(
        self,
        max_tokens_per_minute: int = 200_000,
        buffer_percentage: float = 0.15,  # 15% buffer for safety
        redis_client: Optional[Redis] = None,
        distributed_key: str = "openai_rate_limiter",
    ):
        self.max_tokens_per_minute = max_tokens_per_minute
        self.buffer = int(max_tokens_per_minute * buffer_percentage)
        self._tokens = float(max_tokens_per_minute - self.buffer)
        self._last_check = time.monotonic()
        self._condition = asyncio.Condition()
        self._redis = redis_client
        self._distributed_key = distributed_key
        self._lock_ttl = 70  # 70 seconds TTL for distributed lock
        self._min_tokens_threshold = 5000  # Minimum tokens to keep as reserve

    async def _get_distributed_tokens(self) -> float:
        """Get token count from Redis if available."""
        if not self._redis:
            return self._tokens

        try:
            tokens = await asyncio.to_thread(self._redis.get, f"{self._distributed_key}:tokens")
            return float(tokens) if tokens else float(self.max_tokens_per_minute - self.buffer)
        except Exception as e:
            logger.warning(f"Failed to get distributed tokens: {e}")
            return self._tokens

    async def _set_distributed_tokens(self, tokens: float) -> None:
        """Set token count in Redis if available."""
        if not self._redis:
            return

        try:
            # Store with higher precision to avoid rounding errors
            await asyncio.to_thread(
                self._redis.set,
                f"{self._distributed_key}:tokens",
                f"{tokens:.6f}",  # Store as string with 6 decimal places
                ex=65,  # 65 second expiry
            )
        except Exception as e:
            logger.warning(f"Failed to set distributed tokens: {e}")

    async def _acquire_lock(self) -> bool:
        """Acquire distributed lock using Redis."""
        if not self._redis:
            return True

        try:
            return await asyncio.to_thread(
                self._redis.set,
                f"{self._distributed_key}:lock",
                "1",
                ex=self._lock_ttl,
                nx=True,
            )
        except Exception as e:
            logger.warning(f"Failed to acquire distributed lock: {e}")
            return False

    async def _release_lock(self) -> None:
        """Release distributed lock."""
        if not self._redis:
            return

        try:
            await asyncio.to_thread(self._redis.delete, f"{self._distributed_key}:lock")
        except Exception as e:
            logger.warning(f"Failed to release distributed lock: {e}")

    async def _refill(self) -> None:
        """Refill token bucket based on elapsed time."""
        now = time.monotonic()
        elapsed = now - self._last_check

        # Calculate tokens to add based on elapsed time
        refill = (elapsed * self.max_tokens_per_minute) / 60

        if refill > 0:
            current_tokens = await self._get_distributed_tokens()

            # Calculate new token count with safety margin
            max_allowed = float(self.max_tokens_per_minute - self.buffer)
            new_tokens = min(current_tokens + refill, max_allowed)

            # Update tokens
            self._tokens = new_tokens
            await self._set_distributed_tokens(new_tokens)
            self._last_check = now

    async def _wait_for_tokens(self, needed_tokens: int, current_tokens: float) -> None:
        """Wait for tokens to become available."""
        base_wait_time = (needed_tokens - current_tokens) * 60 / self.max_tokens_per_minute
        wait_time = base_wait_time * 1.1

        # Adding a small random jitter (1-5%) to prevent thundering herd
        jitter = 1 + (0.01 + (time.time() % 0.04))
        wait_time *= jitter

        """ logger.info(
            f"Rate limit approaching. Waiting {wait_time:.2f}s for token replenishment. "
            f"Current: {current_tokens:.2f}, Requested: {needed_tokens}"
        ) """

        # Wait for tokens to refill
        try:
            await asyncio.wait_for(
                self._condition.wait_for(lambda: self._tokens >= needed_tokens), timeout=wait_time
            )
        except asyncio.TimeoutError:
            # If we timeout, we'll check again in the main loop
            pass

    @retry(
        wait=wait_random_exponential(min=1, max=10),
        stop=stop_after_attempt(5),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def acquire(self, tokens: int) -> None:
        """
        Acquire tokens with retries and distributed locking.

        Args:
            tokens: Number of tokens to acquire
        """
        # Add 10% to requested tokens as safety margin
        tokens_with_margin = int(tokens * 1.1)

        if tokens_with_margin > self.max_tokens_per_minute:
            raise ValueError(
                f"Requested tokens ({tokens_with_margin}) exceed maximum per-minute limit "
                f"({self.max_tokens_per_minute})"
            )

        async with self._condition:
            while True:
                # Try to acquire distributed lock
                lock_acquired = await self._acquire_lock()
                if not lock_acquired:
                    # If lock not acquired, wait and retry
                    await asyncio.sleep(0.1)
                    continue

                try:
                    await self._refill()
                    current_tokens = await self._get_distributed_tokens()

                    # Check if we have enough tokens including reserve
                    if current_tokens < (tokens_with_margin + self._min_tokens_threshold):
                        # Release lock while waiting
                        await self._release_lock()
                        await self._wait_for_tokens(
                            tokens_with_margin + self._min_tokens_threshold, current_tokens
                        )
                        continue

                    # We have enough tokens, update the count
                    new_tokens = current_tokens - tokens_with_margin
                    self._tokens = new_tokens
                    await self._set_distributed_tokens(new_tokens)
                    return

                except Exception as e:
                    logger.error(f"Error while acquiring tokens: {e}")
                    raise

                finally:
                    # Always release the lock
                    await self._release_lock()
