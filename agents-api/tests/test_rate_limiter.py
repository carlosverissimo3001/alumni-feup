import asyncio

from app.utils.rate_limiter import TokenRateLimiter


async def test_refill_wakes_a_waiter_instead_of_relying_on_its_own_timeout():
    # Starved of tokens, so acquire() must block inside _wait_for_tokens.
    # With a 600 tokens/min budget and no buffer, its own computed wait_time
    # for 550 tokens from 0 is ~60s - the test only passes quickly if a later
    # refill wakes it, not if it sits out that wait on its own.
    limiter = TokenRateLimiter(max_tokens_per_minute=600, buffer_percentage=0)
    limiter._min_tokens_threshold = 0
    limiter._tokens = 0.0

    waiter = asyncio.create_task(limiter.acquire(500))
    await asyncio.sleep(0.05)
    assert not waiter.done()

    # Simulates tokens having become available by the time some other caller's
    # _refill() runs. acquire(0) exercises that real code path (every acquire
    # refills before checking its own need), rather than calling notify
    # directly, so this proves the fix in _refill - not just that Condition
    # notification works in general.
    limiter._tokens = 600.0
    await limiter.acquire(0)

    await asyncio.wait_for(waiter, timeout=1.0)
