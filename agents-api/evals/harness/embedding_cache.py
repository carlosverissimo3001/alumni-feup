"""Disk cache for embeddings, keyed by the exact query text.

This is the mechanism that makes repeated harness runs free: once a role's
query has been embedded once (with --live), every later run - including a
full 80-role run - reuses the cached vector instead of calling OpenAI again.
"""

from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path
from typing import Dict, List, Optional

DEFAULT_CACHE_PATH = Path(__file__).resolve().parent.parent / ".cache" / "embeddings.json"


def _key(text: str, model: str) -> str:
    return hashlib.sha256(f"{model}:{text}".encode("utf-8")).hexdigest()


class EmbeddingCache:
    def __init__(self, path: Path = DEFAULT_CACHE_PATH):
        self.path = path
        self._data: Dict[str, List[float]] = {}
        if self.path.exists():
            self._data = json.loads(self.path.read_text(encoding="utf-8"))

    def get(self, text: str, model: str) -> Optional[List[float]]:
        return self._data.get(_key(text, model))

    def put(self, text: str, model: str, embedding: List[float]) -> None:
        self._data[_key(text, model)] = embedding
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self._data), encoding="utf-8")

    def get_or_fetch(
        self, text: str, model: str, *, live: bool, fetch_fn
    ) -> tuple[List[float], bool]:
        """Return (embedding, was_cached); raise if not cached and live=False."""
        cached = self.get(text, model)
        if cached is not None:
            return cached, True
        if not live:
            raise RuntimeError(
                f"No cached embedding for query {text!r} and --live was not passed. "
                "Pass --live to allow real OpenAI calls, or run against fixtures that "
                "are already cached."
            )
        start = time.monotonic()
        embedding = fetch_fn(text)
        _ = time.monotonic() - start
        self.put(text, model, embedding)
        return embedding, False
