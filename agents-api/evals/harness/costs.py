"""Cost estimation for the harness's own API usage.

Prices are USD per 1M tokens, snapshotted from OpenAI's published pricing at
the time this harness was written. They drift - this is for the harness's own
pre-flight estimates and reports, not for finance, so check openai.com/pricing
before trusting a total for anything that matters.
"""

from __future__ import annotations

EMBEDDING_MODEL = "text-embedding-3-large"
JUDGE_MODEL = "gpt-4o-mini"

PRICE_PER_1M_TOKENS = {
    "text-embedding-3-large": {"input": 0.13, "output": 0.0},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
}

try:
    import tiktoken

    _ENCODING = tiktoken.get_encoding("o200k_base")

    def count_tokens(text: str) -> int:
        return len(_ENCODING.encode(text))

except Exception:  # pragma: no cover - tiktoken is a transitive dep, this is a fallback only

    def count_tokens(text: str) -> int:
        # ~4 chars/token is the usual English rule of thumb; good enough for
        # a pre-flight cost estimate.
        return max(len(text) // 4, 1)


def estimate_cost_usd(model: str, input_tokens: int, output_tokens: int = 0) -> float:
    price = PRICE_PER_1M_TOKENS[model]
    return (input_tokens * price["input"] + output_tokens * price["output"]) / 1_000_000
