"""The stage order, defined once."""

from typing import Optional

from app.pipeline.stages import PipelineStageName

# PLAN keeps its slot while CAR-158 is outstanding, so filling it in later is not
# a renumber.
STAGE_SEQUENCE: tuple[PipelineStageName, ...] = (
    PipelineStageName.PLAN,
    PipelineStageName.LINKEDIN,
    PipelineStageName.COMPANY,
    PipelineStageName.CLASSIFY_ROLES,
    PipelineStageName.SENIORITY,
    PipelineStageName.LOCATION,
)


def sequence_of(stage: PipelineStageName) -> int:
    return STAGE_SEQUENCE.index(stage)


def next_stage(current: PipelineStageName) -> Optional[PipelineStageName]:
    position = sequence_of(current)
    if position + 1 >= len(STAGE_SEQUENCE):
        return None
    return STAGE_SEQUENCE[position + 1]
