from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy import Uuid as SAUuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base


def _utcnow() -> datetime:
  return datetime.now(timezone.utc)


class InterviewSession(Base):
  __tablename__ = "interview_sessions"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
  target_role: Mapped[str] = mapped_column(String(120), nullable=False)
  mode: Mapped[str] = mapped_column(String(16), nullable=False, default="text")  # text|voice (future)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)

  questions = relationship("InterviewQA", back_populates="session", cascade="all, delete-orphan")


class InterviewQA(Base):
  __tablename__ = "interview_qas"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  session_id: Mapped[uuid.UUID] = mapped_column(
    SAUuid(as_uuid=True),
    ForeignKey("interview_sessions.id", ondelete="CASCADE"),
    index=True,
  )
  question: Mapped[str] = mapped_column(Text, nullable=False)
  answer: Mapped[str | None] = mapped_column(Text, nullable=True)
  feedback_json: Mapped[str | None] = mapped_column(Text, nullable=True)
  score: Mapped[float | None] = mapped_column(Float, nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)

  session = relationship("InterviewSession", back_populates="questions")

