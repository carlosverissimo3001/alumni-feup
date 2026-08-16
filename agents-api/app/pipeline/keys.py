"""Derivation of PipelineTask.idempotency_key.

CAR-155 put a unique constraint on this column, which is what makes dedup a
database guarantee rather than a race between workers. That only holds if the
value is derived the same way every time, so it lives in one function rather
than at each call site.
"""

import hashlib

from app.pipeline.stages import PipelineStageName


def idempotency_key(run_id: str, stage: PipelineStageName, entity_id: str) -> str:
    """Identify one entity's work in one stage of one run.

    Length-prefixed before hashing: joining on a separator alone lets an entity
    id that contains the separator collide with a different triple, which would
    silently drop real work at the unique constraint.

    Scoped to the run because two runs over the same alumni are legitimate - a
    refresh next month is not this month's work.
    """
    parts = (run_id, stage.value, entity_id)
    payload = "".join(f"{len(part)}:{part}" for part in parts)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
