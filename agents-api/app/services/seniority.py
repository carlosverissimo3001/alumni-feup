import asyncio
import logging
from datetime import datetime
from typing import List

from app.agents.seniority import seniority_agent
from app.db.models import Alumni, Role
from app.db.session import get_db
from app.schemas.seniority import AlumniSeniorityParams, BatchSeniorityInput, RoleSeniorityInput
from app.utils.alumni_db import find_all, find_by_ids
from app.utils.role_db import get_roles_by_alumni_id

logger = logging.getLogger(__name__)

# Get a database session for the service
db = next(get_db())


class SeniorityService:
    def _prepare_role_input(self, role: Role) -> RoleSeniorityInput:
        """
        Prepares a role for seniority classification by gathering all necessary context
        """
        # Calculate role duration
        start_date = role.start_date
        end_date = role.end_date or datetime.now()
        duration = self._format_duration(start_date, end_date)

        # Get ESCO classification if available
        esco_classification = None
        if role.job_classification and role.job_classification.esco_classification:
            esco_classification = role.job_classification.esco_classification.title_en

        return RoleSeniorityInput(
            role_id=role.id,
            title=role.role_raw[0].title if role.role_raw else "Unknown",
            description=role.role_raw[0].description if role.role_raw else None,
            duration=duration,
            company=role.company.name,
            esco_classification=esco_classification,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat() if role.end_date else None,
            is_current=role.is_current,
        )

    def _format_duration(self, start_date: datetime, end_date: datetime) -> str:
        """
        Formats the duration between two dates in a human-readable format
        Handles both timezone-aware and naive datetimes
        """
        if start_date.tzinfo:
            start_date = start_date.replace(tzinfo=None)
        if end_date.tzinfo:
            end_date = end_date.replace(tzinfo=None)

        diff = end_date - start_date
        years = diff.days // 365
        months = (diff.days % 365) // 30

        parts = []
        if years > 0:
            parts.append(f"{years} year{'s' if years != 1 else ''}")
        if months > 0:
            parts.append(f"{months} month{'s' if months != 1 else ''}")

        return " and ".join(parts) if parts else "Less than 1 month"

    def _calculate_total_experience(self, roles: List[Role]) -> str:
        """
        Calculates total professional experience from all roles
        Handles overlapping roles intelligently
        """
        if not roles:
            return "0 years"

        sorted_roles = sorted(roles, key=lambda r: r.start_date)

        latest_end = sorted_roles[0].start_date
        total_days = 0

        for role in sorted_roles:
            role_start = (
                role.start_date.replace(tzinfo=None) if role.start_date.tzinfo else role.start_date
            )
            role_end = (role.end_date or datetime.now()).replace(tzinfo=None)
            latest_end = latest_end.replace(tzinfo=None) if latest_end.tzinfo else latest_end

            if role_start > latest_end:
                total_days += (role_end - role_start).days
            else:
                if role_end > latest_end:
                    total_days += (role_end - latest_end).days

            latest_end = max(latest_end, role_end)

        years = total_days // 365
        months = (total_days % 365) // 30

        parts = []
        if years > 0:
            parts.append(f"{years} year{'s' if years != 1 else ''}")
        if months > 0:
            parts.append(f"{months} month{'s' if months != 1 else ''}")

        return " and ".join(parts) if parts else "Less than 1 month"

    def _prepare_batch_input(self, alumni_id: str, roles: List[Role]) -> BatchSeniorityInput:
        """
        Prepares a batch of roles with rich career context
        """
        sorted_roles = sorted(roles, key=lambda r: r.start_date)
    
        role_inputs = [self._prepare_role_input(role) for role in sorted_roles]

        industries = {
            role.company.industry.name
            for role in sorted_roles
            if role.company and role.company.industry
        }
        companies = {role.company.name for role in sorted_roles if role.company}

        return BatchSeniorityInput(
            alumni_id=alumni_id,
            roles=role_inputs,
            total_experience=self._calculate_total_experience(sorted_roles),
            industries=list(industries),
            companies=list(companies),
        )

    async def process_alumni_roles(self, alumni_id: str) -> None:
        """
        Process all roles for an alumni as a batch
        """
        try:
            roles = get_roles_by_alumni_id(alumni_id, db)

            if not roles:
                logger.info(f"No roles found for alumni {alumni_id}")
                return

            batch_input = self._prepare_batch_input(alumni_id, roles)

            await seniority_agent.process_role_batch(batch_input)

        except Exception as e:
            logger.error(f"Error processing roles for alumni {alumni_id}: {str(e)}")

    async def request_alumni_seniority(self, params: AlumniSeniorityParams) -> None:
        """
        Request the classification of the roles of the alumni
        """
        alumni_ids = params.alumni_ids
        alumni: list[Alumni] = []

        if alumni_ids:
            alumni_ids = alumni_ids.split(",")
            alumni = find_by_ids(alumni_ids, db)
        else:
            alumni = find_all(db)

        alumni = list(set(alumni))

        logger.info(f"Going to process roles for {len(alumni)} alumni")

        # Process in batches
        batch_size = 30
        for i in range(0, len(alumni), batch_size):
            batch = alumni[i : i + batch_size]
            logger.info(
                f"Processing batch {i // batch_size + 1} of {(len(alumni) + batch_size - 1) // batch_size} ({len(batch)} alumni)"
            )

            tasks = []
            for alumni_obj in batch:
                task = asyncio.create_task(self.process_alumni_roles(alumni_obj.id))
                tasks.append(task)

            await asyncio.gather(*tasks)

            if i + batch_size < len(alumni):
                await asyncio.sleep(0.5)


seniority_service = SeniorityService()
