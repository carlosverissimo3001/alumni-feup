"""Shared data shapes for the eval harness."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class RoleFixture:
    id: str
    title: str
    description: Optional[str]
    company_name: str
    industry_name: str
    group: str  # "normal" | "challenge"
    set: str  # "dev" | "holdout"
    challenge_tags: List[str]
    acceptable_esco_titles: List[str]
    acceptable_esco_codes: List[str]
    automatic_ok: bool
    rationale: str

    @property
    def query_text(self) -> str:
        if self.description:
            return f"{self.title} {self.description}"
        return self.title

    @property
    def is_known_regression(self) -> bool:
        return "known_regression" in self.challenge_tags


@dataclass
class EscoCandidate:
    id: str
    code: str
    title: str
    confidence: float


@dataclass
class CandidatePacket:
    """A retrieval result saved to disk so judgment-only replays are free."""

    role_id: str
    query_text: str
    candidates: List[EscoCandidate]
    embedding_model: str
    retrieved_at: str


@dataclass
class RetrievalResult:
    role_id: str
    acceptable_codes: List[str]
    ranked_codes: List[str]  # up to top_k=20, by ascending cosine distance
    latency_s: float
    embedding_cost_usd: float
    embedding_cached: bool

    def recall_at(self, k: int) -> bool:
        top = set(self.ranked_codes[:k])
        return bool(top.intersection(self.acceptable_codes))


@dataclass
class JudgeVerdict:
    role_id: str
    top_choice_title: Optional[str]
    top_choice_confidence: Optional[float]
    top_choice_code: Optional[str] = None
    results: List[dict] = field(default_factory=list)
    reasoning: Optional[str] = None
    candidates_had_acceptable: bool = False
    valid_output: bool = True
    error: Optional[str] = None
    latency_s: float = 0.0
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
