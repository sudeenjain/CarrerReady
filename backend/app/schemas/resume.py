from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel


class ResumeAnalyzeResponse(BaseModel):
  resume_id: uuid.UUID
  ats_score: float
  industry_compatibility: float
  detected_skills: list[dict[str, Any]]
  suggestions: list[str]

