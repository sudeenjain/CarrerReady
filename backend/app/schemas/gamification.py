from __future__ import annotations

import uuid
from pydantic import BaseModel


class BadgePublic(BaseModel):
  code: str
  name: str
  description: str


class MyGamification(BaseModel):
  xp: int
  streak_days: int
  badges: list[BadgePublic]


class LeaderboardEntry(BaseModel):
  rank: int
  user_id: uuid.UUID
  name: str
  xp: int


class LeaderboardResponse(BaseModel):
  entries: list[LeaderboardEntry]

