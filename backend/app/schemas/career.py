from __future__ import annotations

from pydantic import BaseModel, Field


class CareerPredictRequest(BaseModel):
  skills: list[str] = Field(default_factory=list)
  profile_summary: str | None = None


class CareerRecommendation(BaseModel):
  role: str
  probability: float
  why: str


class CareerPredictResponse(BaseModel):
  recommendations: list[CareerRecommendation]

