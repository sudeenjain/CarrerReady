from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy import Uuid as SAUuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base


def _utcnow() -> datetime:
  return datetime.now(timezone.utc)


class XPEvent(Base):
  __tablename__ = "xp_events"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)

  kind: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g., "resume_analyzed"
  points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)

  user = relationship("User", back_populates="xp_events")


class Badge(Base):
  __tablename__ = "badges"
  __table_args__ = (UniqueConstraint("code", name="uq_badges_code"),)

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  code: Mapped[str] = mapped_column(String(64), nullable=False)
  name: Mapped[str] = mapped_column(String(120), nullable=False)
  description: Mapped[str] = mapped_column(String(280), nullable=False)


class UserBadge(Base):
  __tablename__ = "user_badges"
  __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badges_user_badge"),)

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
  badge_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), index=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)

  user = relationship("User", back_populates="badges")
  badge = relationship("Badge")

