from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserPublic(BaseModel):
  id: uuid.UUID
  email: EmailStr
  full_name: str | None = None
  role: str
  target_role: str | None = None
  xp: int = 0
  streak_days: int = 0
  created_at: datetime


class UserUpdate(BaseModel):
  full_name: str | None = Field(default=None, max_length=200)
  target_role: str | None = Field(default=None, max_length=120)

