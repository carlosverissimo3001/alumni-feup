import asyncio
import logging
import math

from app.agents.job_classification import job_classification_agent
from app.db import get_db
from app.db.models import Alumni
from app.schemas.job_classification import (
    AlumniJobClassificationParams,
)
from app.utils.alumni_db import find_all, find_by_ids
from app.utils.role_db import get_extended_roles_by_alumni_id

logger = logging.getLogger(__name__)

db = next(get_db())


class JobClassificationService:
    def __init__(self):
        self.MAX_CONCURRENT = 10
        self.BATCH_SIZE = 50

    async def classify_roles_for_alumni(self, alumni_id: str):
        try:
            self.active_classifications.inc()
            input_data = get_extended_roles_by_alumni_id(alumni_id, db)
            if not input_data.roles:
                return

            roles = input_data.roles

            for i in range(0, len(roles), self.MAX_CONCURRENT):
                batch = roles[i : i + self.MAX_CONCURRENT]
                await self._process_roles_batch(batch)
                if i + self.MAX_CONCURRENT < len(roles):
                    await asyncio.sleep(0.1)

        except Exception as e:
            logger.error(f"Error classifying roles for alumni {alumni_id}: {str(e)}")
        finally:
            self.active_classifications.dec()

    async def request_alumni_classification(self, params: AlumniJobClassificationParams):
        """
        Request the classification of the roles of the alumni
        """
        alumni_ids = params.alumni_ids
        alumni: list[Alumni] = []

        if alumni_ids:
            alumni = find_by_ids(alumni_ids.split(","), db)
        else:
            alumni = find_all(db)

        alumni = list(set(alumni))
        logger.info(f"Going to update {len(alumni)} alumni")

        for i in range(0, len(alumni), self.BATCH_SIZE):
            batch = alumni[i : i + self.BATCH_SIZE]
            batch_no = i // self.BATCH_SIZE + 1
            logger.info(
                f"Processing batch {batch_no} of {math.ceil(len(alumni) / self.BATCH_SIZE)}"
            )

            tasks = [
                asyncio.create_task(job_classification_agent.classify_roles_for_alumni(al.id))
                for al in batch
            ]
            await asyncio.gather(*tasks)

            if i + self.BATCH_SIZE < len(alumni):
                await asyncio.sleep(0.1)


job_classification_service = JobClassificationService()
