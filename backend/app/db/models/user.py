from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, UniqueConstraint
from sqlalchemy import Uuid as SAUuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base


class UserRole(str, enum.Enum):
  STUDENT = "student"
  ADMIN = "admin"


def _utcnow() -> datetime:
  return datetime.now(timezone.utc)


class User(Base):
  __tablename__ = "users"
  __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
  hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
  full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
  role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.STUDENT)
  is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

  target_role: Mapped[str | None] = mapped_column(String(120), nullable=True)

  xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  last_activity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

  resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
  xp_events = relationship("XPEvent", back_populates="user", cascade="all, delete-orphan")
  badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")

