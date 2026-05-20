from __future__ import annotations

import uuid
from datetime import datetime, timezone

# pyrefly: ignore [missing-import]
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
# pyrefly: ignore [missing-import]
from sqlalchemy import Uuid as SAUuid
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import JSONB
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
# pyrefly: ignore [missing-import]
from ..base import Base

def _utcnow() -> datetime:
  return datetime.now(timezone.utc)

class Roadmap(Base):
  __tablename__ = "roadmaps"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  target_role: Mapped[str] = mapped_column(String(120), nullable=False)
  streak: Mapped[int] = mapped_column(Integer, default=0)
  total_learning_hours: Mapped[float] = mapped_column(Float, default=0.0)
  github_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
  ai_recommendations: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
  is_active: Mapped[bool] = mapped_column(Boolean, default=True)

  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

  user = relationship("User", backref="roadmaps")
  days = relationship("RoadmapDay", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapDay.day_number")

class RoadmapDay(Base):
  __tablename__ = "roadmap_days"

  id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
  roadmap_id: Mapped[uuid.UUID] = mapped_column(SAUuid(as_uuid=True), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
  day_number: Mapped[int] = mapped_column(Integer, nullable=False)
  phase: Mapped[str] = mapped_column(String(50), nullable=False)
  primary_goal: Mapped[str] = mapped_column(String(255), nullable=False)
  learning_task: Mapped[str] = mapped_column(Text, nullable=False)
  practice_task: Mapped[str] = mapped_column(Text, nullable=False)
  building_task: Mapped[str] = mapped_column(Text, nullable=False)
  review_task: Mapped[str] = mapped_column(Text, nullable=False)
  expected_output: Mapped[str] = mapped_column(Text, nullable=False)
  time_estimate: Mapped[str] = mapped_column(String(50), nullable=False)
  milestone: Mapped[str | None] = mapped_column(String(255), nullable=True)
  youtube_video_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
  resource_links: Mapped[list | None] = mapped_column(JSONB, nullable=True)
  difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
  points: Mapped[int] = mapped_column(Integer, default=100)
  interview_questions: Mapped[list | None] = mapped_column(JSONB, nullable=True)

  completion_status: Mapped[dict | None] = mapped_column(JSONB, nullable=True) # {"learn": bool, "practice": bool, "build": bool, "review": bool}
  watched_videos: Mapped[list | None] = mapped_column(JSONB, nullable=True)
  notes: Mapped[str | None] = mapped_column(Text, nullable=True)
  weak_topics: Mapped[list | None] = mapped_column(JSONB, nullable=True)

  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

  roadmap = relationship("Roadmap", back_populates="days")
