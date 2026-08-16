"""Transition rules for the staged pipeline.

Pure functions over plain values: nothing here opens a session, touches Redis or
knows arq exists. The executor builds `TaskCounts` from rows and asks these
functions what to do next, which is what lets the rules that decide whether a run
continues be tested with no infrastructure.
"""

import enum
from dataclasses import dataclass
from typing import Tuple

from app.pipeline.sequence import STAGE_SEQUENCE, sequence_of
from app.pipeline.stages import PipelineStageName

# Below this many finished tasks the failure rate is noise: the first task
# failing reads as 100% and would abort a 3000-task run on one transient error.
MIN_SAMPLE_FOR_THRESHOLD = 20


class StageOutcome(str, enum.Enum):
    RUNNING = "RUNNING"
    COMPLETE = "COMPLETE"
    ABORT_THRESHOLD = "ABORT_THRESHOLD"
    # Not derivable from counts - the executor observes it and reports it here
    # so callers have one outcome type to branch on.
    CANCELLED = "CANCELLED"


@dataclass(frozen=True)
class TaskCounts:
    total: int
    succeeded: int
    failed: int
    skipped: int

    @property
    def terminal(self) -> int:
        return self.succeeded + self.failed + self.skipped

    @property
    def pending(self) -> int:
        return self.total - self.terminal

    @property
    def failure_rate(self) -> float:
        """Failures as a share of what has finished, not of the whole stage.

        Against `total`, a stage whose first hundred tasks all failed out of a
        thousand reports 10% and keeps spending money on an endpoint that is
        down. Against `terminal` the threshold is an early stop rather than a
        post-mortem.
        """
        if self.terminal == 0:
            return 0.0
        return self.failed / self.terminal


def should_abort(counts: TaskCounts, threshold: float) -> bool:
    """Exclusive: a threshold of 0.2 permits exactly 20% and trips above it."""
    if counts.terminal < MIN_SAMPLE_FOR_THRESHOLD:
        return False
    return counts.failure_rate > threshold


def stage_outcome(counts: TaskCounts, threshold: float) -> StageOutcome:
    """Aborting outranks completing.

    A stage that reached the end with 80% failures must not hand its output to
    the next stage merely because it has nothing left to run.
    """
    if should_abort(counts, threshold):
        return StageOutcome.ABORT_THRESHOLD
    if counts.pending <= 0:
        # Empty stages land here too: nothing to wait for is done, not stuck.
        return StageOutcome.COMPLETE
    return StageOutcome.RUNNING


def resume_targets(from_stage: PipelineStageName) -> Tuple[PipelineStageName, ...]:
    return STAGE_SEQUENCE[sequence_of(from_stage) :]
