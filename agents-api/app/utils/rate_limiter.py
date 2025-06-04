import asyncio
import time


class TokenRateLimiter:
    """Asynchronous token-based rate limiter."""

    def __init__(self, max_tokens_per_minute: int = 200_000):
        self.max_tokens_per_minute = max_tokens_per_minute
        self._tokens = max_tokens_per_minute
        self._last_check = time.monotonic()
        self._condition = asyncio.Condition()

    async def acquire(self, tokens: int) -> None:
        async with self._condition:
            await self._refill()
            while self._tokens < tokens:
                wait_time = (tokens - self._tokens) * 60 / self.max_tokens_per_minute
                await self._condition.wait_for(lambda: self._tokens >= tokens or time.monotonic() - self._last_check >= wait_time)
                await self._refill()
            self._tokens -= tokens

    async def _refill(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_check
        refill = (elapsed * self.max_tokens_per_minute) / 60
        if refill > 0:
            self._tokens = min(self._tokens + refill, self.max_tokens_per_minute)
            self._last_check = now
