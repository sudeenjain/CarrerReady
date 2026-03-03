from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy import Uuid as SAUuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base


def _utcnow() -> datetime:
  return datetime.now(timezone.utc)


class Resume(Base):
  __tablename__ = "resumes"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)

  filename: Mapped[str] = mapped_column(String(260), nullable=False)
  content_type: Mapped[str | None] = mapped_column(String(120), nullable=True)

  extracted_text: Mapped[str] = mapped_column(Text, nullable=False, default="")

  ats_score: Mapped[float | None] = mapped_column(Float, nullable=True)
  industry_compatibility: Mapped[float | None] = mapped_column(Float, nullable=True)
  suggestions_json: Mapped[str | None] = mapped_column(Text, nullable=True)
  skills_json: Mapped[str | None] = mapped_column(Text, nullable=True)

  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)

  user = relationship("User", back_populates="resumes")

