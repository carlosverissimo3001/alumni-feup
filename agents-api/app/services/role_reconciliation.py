"""Fetch-first-then-reconcile matching for LinkedIn-derived roles (CAR-481).

No stable experience ID exists in the source payload, so matching is an
exact-repeat fingerprint (company URL + start date + normalized title); an
ambiguous overlap becomes a conflict rather than a guess. Nothing here
commits - the caller owns one transaction per alumnus.
"""

import hashlib
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.db.models import Company, JobClassification, Role, RoleRaw, SeniorityLevel
from app.schemas.linkedin import ExperienceBase
from app.utils.company_db import get_company_by_linkedin_url
from app.utils.consts import REMOTE_LOCATION_ID
from app.utils.misc.convert import linkedin_date_to_timestamp
from app.utils.misc.string import sanitize_linkedin_url

logger = logging.getLogger(__name__)

FINGERPRINT_VERSION = "v1"


class ReconciliationConflictError(Exception):
    pass


def _normalize_title(title: Optional[str]) -> str:
    return " ".join((title or "").strip().lower().split())


def compute_fingerprint(company_url: Optional[str], start_date: datetime, title: str) -> str:
    normalized_url = (company_url or "").strip().lower()
    date_part = start_date.date().isoformat() if start_date else ""
    normalized_title = _normalize_title(title)
    raw = f"{FINGERPRINT_VERSION}|{normalized_url}|{date_part}|{normalized_title}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


@dataclass
class ReconciliationOutcome:
    alumni_id: str
    inserted_role_ids: List[str] = field(default_factory=list)
    updated_role_ids: List[str] = field(default_factory=list)
    newly_missing_role_ids: List[str] = field(default_factory=list)
    invalidated_classification_role_ids: List[str] = field(default_factory=list)
    new_companies: Dict[str, str] = field(default_factory=dict)
    conflict: Optional[str] = None

    @property
    def roles_changed(self) -> bool:
        return bool(self.inserted_role_ids or self.updated_role_ids)

    @property
    def ok(self) -> bool:
        return self.conflict is None


@dataclass
class _Candidate:
    experience: ExperienceBase
    company: Company
    sanitized_company_url: str
    start_date: datetime
    end_date: Optional[datetime]
    fingerprint: str


def _get_or_create_company(
    db: Session, sanitized_url: str, fallback_name: Optional[str], new_companies: Dict[str, str]
) -> Company:
    company = get_company_by_linkedin_url(sanitized_url, db)
    if company:
        return company
    company = Company(linkedin_url=sanitized_url, name=fallback_name)
    db.add(company)
    db.flush()
    new_companies[company.id] = sanitized_url
    return company


def _build_candidates(
    db: Session, experiences: List[ExperienceBase], new_companies: Dict[str, str]
) -> List[_Candidate]:
    candidates = []
    for exp in experiences:
        if not exp.company_linkedin_profile_url:
            continue
        start_date = linkedin_date_to_timestamp(exp.starts_at)
        if not start_date:
            continue
        end_date = linkedin_date_to_timestamp(exp.ends_at) if exp.ends_at else None
        sanitized_url = sanitize_linkedin_url(exp.company_linkedin_profile_url)
        company = _get_or_create_company(db, sanitized_url, exp.company, new_companies)
        fingerprint = compute_fingerprint(sanitized_url, start_date, exp.title)
        candidates.append(
            _Candidate(
                experience=exp,
                company=company,
                sanitized_company_url=sanitized_url,
                start_date=start_date,
                end_date=end_date,
                fingerprint=fingerprint,
            )
        )
    return candidates


def reconcile_alumni_roles(
    db: Session,
    alumni_id: str,
    experiences: List[ExperienceBase],
    experiences_field_present: bool = True,
) -> ReconciliationOutcome:
    outcome = ReconciliationOutcome(alumni_id=alumni_id)
    candidates = _build_candidates(db, experiences, outcome.new_companies)

    seen_fingerprints: Dict[str, _Candidate] = {}
    for cand in candidates:
        if cand.fingerprint in seen_fingerprints:
            outcome.conflict = (
                f"Duplicate source entries for alumnus {alumni_id}: "
                f"'{cand.experience.title}' at company {cand.company.id} "
                f"starting {cand.start_date.date()} appears more than once "
                "in the same fetch"
            )
            return outcome
        seen_fingerprints[cand.fingerprint] = cand

    existing_roles: List[Role] = db.query(Role).filter(Role.alumni_id == alumni_id).all()
    fingerprinted = {r.source_fingerprint: r for r in existing_roles if r.source_fingerprint}

    role_ids = [r.id for r in existing_roles]
    titles_by_role_id: Dict[str, str] = {}
    if role_ids:
        for raw in db.query(RoleRaw).filter(RoleRaw.role_id.in_(role_ids)).all():
            titles_by_role_id[raw.role_id] = raw.title

    by_company_start: Dict[Tuple[str, object], List[Role]] = defaultdict(list)
    for r in existing_roles:
        by_company_start[(r.company_id, r.start_date.date() if r.start_date else None)].append(r)

    matched_role_ids: set = set()
    to_insert: List[_Candidate] = []
    to_update: List[Tuple[Role, _Candidate]] = []
    conflicts: List[str] = []

    for cand in candidates:
        existing = fingerprinted.get(cand.fingerprint)
        if existing is not None and existing.id not in matched_role_ids:
            matched_role_ids.add(existing.id)
            to_update.append((existing, cand))
            continue

        key = (cand.company.id, cand.start_date.date())
        same_slot = by_company_start.get(key, [])

        # Adopt a pre-fingerprinting role with an exact (company, start,
        # title) match instead of inserting a duplicate.
        adoptable = next(
            (
                r
                for r in same_slot
                if r.id not in matched_role_ids
                and r.source_fingerprint is None
                and _normalize_title(titles_by_role_id.get(r.id, ""))
                == _normalize_title(cand.experience.title)
            ),
            None,
        )
        if adoptable is not None:
            matched_role_ids.add(adoptable.id)
            to_update.append((adoptable, cand))
            continue

        # Could be a title edit, could be coincidence - no way to tell them
        # apart, so this flags a conflict rather than guessing.
        unmatched_same_slot = [r for r in same_slot if r.id not in matched_role_ids]
        if unmatched_same_slot:
            conflicts.append(
                f"Possible edit of an existing role at company {cand.company.id} "
                f"starting {cand.start_date.date()}: new title "
                f"'{cand.experience.title}' vs existing role(s) "
                f"{[r.id for r in unmatched_same_slot]}"
            )
            continue

        to_insert.append(cand)

    if conflicts:
        outcome.conflict = "; ".join(conflicts)
        return outcome

    for cand in to_insert:
        role = Role(
            alumni_id=alumni_id,
            company_id=cand.company.id,
            location_id=REMOTE_LOCATION_ID,
            start_date=cand.start_date,
            end_date=cand.end_date,
            seniority_level=SeniorityLevel.ASSOCIATE,
            is_current=cand.end_date is None,
            is_promotion=False,
            source_fingerprint=cand.fingerprint,
            source_company_url=cand.sanitized_company_url,
        )
        db.add(role)
        db.flush()
        db.add(
            RoleRaw(
                role_id=role.id,
                title=cand.experience.title,
                description=cand.experience.description,
                location=cand.experience.location,
            )
        )
        outcome.inserted_role_ids.append(role.id)

    for role, cand in to_update:
        role.company_id = cand.company.id
        role.end_date = cand.end_date
        role.is_current = cand.end_date is None
        role.source_fingerprint = cand.fingerprint
        role.source_company_url = cand.sanitized_company_url
        role.source_missing_since = None
        role.updated_by = "linkedin-reconciliation"

        role_raw = db.query(RoleRaw).filter(RoleRaw.role_id == role.id).first()
        content_changed = role_raw is not None and (
            role_raw.title != cand.experience.title
            or role_raw.description != cand.experience.description
        )
        if role_raw:
            role_raw.title = cand.experience.title
            role_raw.description = cand.experience.description
            role_raw.location = cand.experience.location
        else:
            db.add(
                RoleRaw(
                    role_id=role.id,
                    title=cand.experience.title,
                    description=cand.experience.description,
                    location=cand.experience.location,
                )
            )
        outcome.updated_role_ids.append(role.id)

        # CLASSIFY_ROLES only considers roles without a classification.
        if content_changed:
            existing_classification = (
                db.query(JobClassification).filter(JobClassification.role_id == role.id).first()
            )
            if existing_classification and not (
                existing_classification.was_accepted_by_user
                or existing_classification.was_modified_by_user
            ):
                db.delete(existing_classification)
                outcome.invalidated_classification_role_ids.append(role.id)

    if experiences_field_present:
        for role in fingerprinted.values():
            if role.id in matched_role_ids:
                continue
            if role.source_missing_since is None:
                role.source_missing_since = datetime.now(timezone.utc)
                outcome.newly_missing_role_ids.append(role.id)

    db.flush()
    return outcome
