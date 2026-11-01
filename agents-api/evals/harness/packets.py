"""Save/load candidate packets so judgment-only mode can replay for free.

A packet freezes what retrieval produced for a role at build time (the exact
input the LLM validator sees). Judgment-only mode reads these back instead of
calling the embedding API or the DB, so re-running it to test a prompt change
costs only the LLM call it's actually testing.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from sqlalchemy import select

from app.db.models import EscoClassification
from app.db.session import SessionLocal
from app.utils.agents.esco_reference import search_esco_classifications
from evals.harness.costs import EMBEDDING_MODEL
from evals.harness.embedding_cache import EmbeddingCache
from evals.harness.models import CandidatePacket, EscoCandidate, RoleFixture


def _codes_by_id(ids: List[str]) -> dict:
    """search_esco_classifications's EscoResult only carries id/title/confidence
    (its pydantic schema has no `code` field, so the code SQLAlchemy selects
    gets silently dropped on the way in) - look codes back up by id so packets
    and fixtures can be compared on the stable ESCO code rather than id."""
    if not ids:
        return {}
    db = SessionLocal()
    try:
        rows = db.execute(
            select(EscoClassification.id, EscoClassification.code).where(
                EscoClassification.id.in_(ids)
            )
        ).all()
        return {row.id: row.code for row in rows}
    finally:
        db.close()

DEFAULT_PACKETS_DIR = Path(__file__).resolve().parent.parent / ".packets"


def packet_path(role_id: str, packets_dir: Path = DEFAULT_PACKETS_DIR) -> Path:
    return packets_dir / f"{role_id}.json"


def save_packet(packet: CandidatePacket, packets_dir: Path = DEFAULT_PACKETS_DIR) -> None:
    packets_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "role_id": packet.role_id,
        "query_text": packet.query_text,
        "embedding_model": packet.embedding_model,
        "retrieved_at": packet.retrieved_at,
        "candidates": [c.__dict__ for c in packet.candidates],
    }
    packet_path(packet.role_id, packets_dir).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def load_packet(role_id: str, packets_dir: Path = DEFAULT_PACKETS_DIR) -> Optional[CandidatePacket]:
    path = packet_path(role_id, packets_dir)
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    return CandidatePacket(
        role_id=data["role_id"],
        query_text=data["query_text"],
        embedding_model=data["embedding_model"],
        retrieved_at=data["retrieved_at"],
        candidates=[EscoCandidate(**c) for c in data["candidates"]],
    )


def build_packet(
    fixture: RoleFixture,
    *,
    live: bool,
    cache: EmbeddingCache,
) -> CandidatePacket:
    """Runs the real (read-only) production retrieval+rerank for one role.

    Uses app.utils.agents.esco_reference.search_esco_classifications - the
    exact function app.agents.job_classification calls - so the packet
    reflects what production retrieval actually returns, not a harness
    reimplementation of it.
    """
    # search_esco_classifications calls generate_embedding() itself, so route
    # that one call through the cache rather than duplicating its SQL here.
    import app.utils.agents.esco_reference as esco_reference_module

    original_generate_embedding = esco_reference_module.generate_embedding

    def cached_generate_embedding(text: str) -> List[float]:
        embedding, _ = cache.get_or_fetch(
            text, EMBEDDING_MODEL, live=live, fetch_fn=original_generate_embedding
        )
        return embedding

    esco_reference_module.generate_embedding = cached_generate_embedding
    try:
        raw_candidates = search_esco_classifications(fixture.query_text)
    finally:
        esco_reference_module.generate_embedding = original_generate_embedding

    codes = _codes_by_id([c.id for c in raw_candidates])
    candidates = [
        EscoCandidate(id=c.id, code=codes.get(c.id, ""), title=c.title, confidence=c.confidence)
        for c in raw_candidates
    ]
    return CandidatePacket(
        role_id=fixture.id,
        query_text=fixture.query_text,
        candidates=candidates,
        embedding_model=EMBEDDING_MODEL,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
    )
