"""Transition rules for the staged pipeline (CAR-157).

These tests import nothing that touches a database, Redis or arq. That is the
point: the stage machine is the part worth being certain about, and it is only
worth being certain about if the certainty is cheap to re-establish on every
push. `app.db` constructs an engine at import time, so importing the enums from
there would drag the database into a test that has no business knowing about
it - hence `app.pipeline.stages`.
"""

import pytest

from app.pipeline.sequence import STAGE_SEQUENCE, next_stage, sequence_of
from app.pipeline.stages import PipelineStageName
from app.pipeline.state import (
    MIN_SAMPLE_FOR_THRESHOLD,
    StageOutcome,
    TaskCounts,
    resume_targets,
    should_abort,
    stage_outcome,
)


class TestStageSequence:
    def test_sequence_is_the_documented_order(self):
        assert STAGE_SEQUENCE == (
            PipelineStageName.PLAN,
            PipelineStageName.LINKEDIN,
            PipelineStageName.COMPANY,
            PipelineStageName.CLASSIFY_ROLES,
            PipelineStageName.SENIORITY,
            PipelineStageName.LOCATION,
        )

    def test_sequence_covers_every_stage(self):
        # A stage added to the enum but not the sequence would silently never
        # run, which is the kind of omission that only shows up in production.
        assert set(STAGE_SEQUENCE) == set(PipelineStageName)

    @pytest.mark.parametrize(
        "current,expected",
        [
            (PipelineStageName.PLAN, PipelineStageName.LINKEDIN),
            (PipelineStageName.LINKEDIN, PipelineStageName.COMPANY),
            (PipelineStageName.COMPANY, PipelineStageName.CLASSIFY_ROLES),
            (PipelineStageName.CLASSIFY_ROLES, PipelineStageName.SENIORITY),
            (PipelineStageName.SENIORITY, PipelineStageName.LOCATION),
        ],
    )
    def test_next_stage_advances_one_step(self, current, expected):
        assert next_stage(current) == expected

    def test_next_stage_is_none_at_the_end(self):
        assert next_stage(PipelineStageName.LOCATION) is None

    def test_sequence_of_matches_position(self):
        assert sequence_of(PipelineStageName.PLAN) == 0
        assert sequence_of(PipelineStageName.CLASSIFY_ROLES) == 3
        assert sequence_of(PipelineStageName.LOCATION) == 5


class TestTaskCounts:
    def test_terminal_sums_the_finished_statuses(self):
        counts = TaskCounts(total=10, succeeded=4, failed=2, skipped=1)
        assert counts.terminal == 7

    def test_pending_is_what_is_left(self):
        counts = TaskCounts(total=10, succeeded=4, failed=2, skipped=1)
        assert counts.pending == 3

    def test_failure_rate_is_measured_against_terminal_not_total(self):
        # Half of what has finished has failed, even though only a fifth of the
        # stage has been attempted. Measuring against total would report 0.1 and
        # hide a stage that is failing outright.
        counts = TaskCounts(total=100, succeeded=10, failed=10, skipped=0)
        assert counts.failure_rate == 0.5

    def test_failure_rate_is_zero_before_anything_finishes(self):
        assert TaskCounts(total=100, succeeded=0, failed=0, skipped=0).failure_rate == 0.0


class TestShouldAbort:
    def test_does_not_abort_below_the_threshold(self):
        counts = TaskCounts(total=100, succeeded=90, failed=10, skipped=0)
        assert should_abort(counts, threshold=0.2) is False

    def test_aborts_above_the_threshold(self):
        counts = TaskCounts(total=100, succeeded=60, failed=40, skipped=0)
        assert should_abort(counts, threshold=0.2) is True

    def test_threshold_is_exclusive(self):
        # "abort if MORE than 20% fail" - exactly 20% keeps going.
        counts = TaskCounts(total=100, succeeded=80, failed=20, skipped=0)
        assert counts.failure_rate == 0.2
        assert should_abort(counts, threshold=0.2) is False

    def test_does_not_abort_on_a_small_sample(self):
        # One failure out of one attempt is a 100% failure rate but proves
        # nothing. Aborting a 3000-task run on it would be absurd.
        counts = TaskCounts(total=3000, succeeded=0, failed=1, skipped=0)
        assert counts.failure_rate == 1.0
        assert should_abort(counts, threshold=0.2) is False

    def test_aborts_once_the_sample_is_large_enough(self):
        counts = TaskCounts(total=3000, succeeded=0, failed=MIN_SAMPLE_FOR_THRESHOLD, skipped=0)
        assert should_abort(counts, threshold=0.2) is True

    def test_skipped_tasks_count_as_sample_but_not_as_failures(self):
        # A skipped task is a decision, not a fault - it should not drag the
        # failure rate up, but it does mean the stage is making progress.
        counts = TaskCounts(total=100, succeeded=0, failed=0, skipped=50)
        assert counts.failure_rate == 0.0
        assert should_abort(counts, threshold=0.2) is False

    def test_a_threshold_of_zero_aborts_on_any_failure_once_sampled(self):
        counts = TaskCounts(total=100, succeeded=MIN_SAMPLE_FOR_THRESHOLD, failed=1, skipped=0)
        assert should_abort(counts, threshold=0.0) is True


class TestStageOutcome:
    def test_running_while_tasks_remain(self):
        counts = TaskCounts(total=10, succeeded=5, failed=0, skipped=0)
        assert stage_outcome(counts, threshold=0.2) is StageOutcome.RUNNING

    def test_complete_when_every_task_is_terminal(self):
        counts = TaskCounts(total=10, succeeded=8, failed=1, skipped=1)
        assert stage_outcome(counts, threshold=0.2) is StageOutcome.COMPLETE

    def test_complete_when_the_stage_has_no_work(self):
        # An empty stage is done, not stuck. Returning RUNNING here would hang
        # the run on a stage that will never produce another event.
        counts = TaskCounts(total=0, succeeded=0, failed=0, skipped=0)
        assert stage_outcome(counts, threshold=0.2) is StageOutcome.COMPLETE

    def test_abort_takes_precedence_over_still_running(self):
        counts = TaskCounts(total=1000, succeeded=10, failed=90, skipped=0)
        assert stage_outcome(counts, threshold=0.2) is StageOutcome.ABORT_THRESHOLD

    def test_abort_takes_precedence_over_complete(self):
        # The stage finished, but it finished badly. The run must not advance to
        # the next stage on top of mostly-failed input.
        counts = TaskCounts(total=100, succeeded=20, failed=80, skipped=0)
        assert stage_outcome(counts, threshold=0.2) is StageOutcome.ABORT_THRESHOLD


class TestResumeTargets:
    def test_resumes_from_the_named_stage_onwards(self):
        assert resume_targets(PipelineStageName.COMPANY) == (
            PipelineStageName.COMPANY,
            PipelineStageName.CLASSIFY_ROLES,
            PipelineStageName.SENIORITY,
            PipelineStageName.LOCATION,
        )

    def test_earlier_stages_are_never_included(self):
        targets = resume_targets(PipelineStageName.SENIORITY)
        assert PipelineStageName.LINKEDIN not in targets
        assert PipelineStageName.CLASSIFY_ROLES not in targets

    def test_resuming_the_last_stage_targets_only_itself(self):
        assert resume_targets(PipelineStageName.LOCATION) == (PipelineStageName.LOCATION,)

    def test_resuming_the_first_stage_targets_everything(self):
        assert resume_targets(PipelineStageName.PLAN) == STAGE_SEQUENCE
