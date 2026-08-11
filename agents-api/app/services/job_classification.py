import asyncio
import logging
import math

from app.agents.job_classification import job_classification_agent
from app.db.models import Alumni
from app.db.session import session_scope
from app.schemas.job_classification import (
    AlumniJobClassificationParams,
)
from app.utils.alumni_db import find_all, find_by_ids
from app.utils.pipeline_timeout import with_pipeline_timeout
from app.utils.role_db import get_extended_roles_by_alumni_id

logger = logging.getLogger(__name__)


class JobClassificationService:
    def __init__(self):
        self.MAX_CONCURRENT = 25
        self.BATCH_SIZE = 50

    async def classify_roles_for_alumni(self, alumni_id: str):
        try:
            # Its own session: these run concurrently under asyncio.gather.
            with session_scope() as db:
                input_data = get_extended_roles_by_alumni_id(alumni_id, db)
                if not input_data.roles:
                    return
                roles = input_data.roles

            for i in range(0, len(roles), self.MAX_CONCURRENT):
                batch = roles[i : i + self.MAX_CONCURRENT]
                await with_pipeline_timeout(
                    job_classification_agent._process_roles_batch(batch, alumni_id),
                    step="job_classification.process_roles_batch",
                )
                if i + self.MAX_CONCURRENT < len(roles):
                    await asyncio.sleep(0.1)

        except Exception as e:
            logger.error(f"Error classifying roles for alumni {alumni_id}: {str(e)}")

    async def request_alumni_classification(self, params: AlumniJobClassificationParams):
        """
        Request the classification of the roles of the alumni
        """
        alumni_ids = params.alumni_ids

        # Session held for the lookup only - the batches below are minutes of
        # LLM calls and should not pin a connection.
        with session_scope() as db:
            alumni: list[Alumni] = (
                find_by_ids(alumni_ids.split(","), db) if alumni_ids else find_all(db)
            )
            ids = list({al.id for al in alumni})

        logger.info(f"Going to update {len(ids)} alumni")

        for i in range(0, len(ids), self.BATCH_SIZE):
            batch = ids[i : i + self.BATCH_SIZE]
            batch_no = i // self.BATCH_SIZE + 1
            logger.info(f"Processing batch {batch_no} of {math.ceil(len(ids) / self.BATCH_SIZE)}")

            tasks = [asyncio.create_task(self.classify_roles_for_alumni(aid)) for aid in batch]
            await asyncio.gather(*tasks)

            if i + self.BATCH_SIZE < len(alumni):
                await asyncio.sleep(0.1)


job_classification_service = JobClassificationService()
