from __future__ import annotations

from pydantic import BaseModel


class DashboardSummary(BaseModel):
  xp: int
  streak_days: int
  resumes_analyzed: int
  avg_ats_score: float | None = None
  interviews_answered: int


class ReadinessSummary(BaseModel):
  dsa_score: float
  aptitude_score: float
  interview_score: float
  company_readiness: dict[str, float]

