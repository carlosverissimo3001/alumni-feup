"""Recovering work a dead worker left mid-flight.

A killed worker leaves its in-flight tasks in RUNNING with nothing to move them.
They are indistinguishable from live work except by age, which is why the sweep
is a timeout rather than a status check.
"""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.models import PipelineTask
from app.pipeline.stages import PipelineTaskStatus

logger = logging.getLogger(__name__)

# Above the worker's job_timeout of six hours, so a stage that is merely slow is
# never mistaken for a dead one.
DEFAULT_STUCK_TIMEOUT = timedelta(hours=8)


def recover_stuck_tasks(session: Session, timeout: timedelta = DEFAULT_STUCK_TIMEOUT) -> int:
    """Return tasks abandoned in RUNNING to QUEUED, returning how many."""
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timeout

    reset = (
        session.query(PipelineTask)
        .filter(
            PipelineTask.status == PipelineTaskStatus.RUNNING,
            PipelineTask.started_at < cutoff,
        )
        # "fetch" rather than False: the startup sweep runs on a fresh session
        # where it would not matter, but a caller holding those rows would
        # otherwise keep seeing RUNNING after the reset. One extra SELECT on a
        # once-per-startup sweep is not worth that trap.
        .update({PipelineTask.status: PipelineTaskStatus.QUEUED}, synchronize_session="fetch")
    )

    if reset:
        logger.warning("Reset %s task(s) abandoned in RUNNING past %s", reset, timeout)
    return reset
