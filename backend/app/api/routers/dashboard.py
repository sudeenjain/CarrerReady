from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db.models.interview import InterviewQA, InterviewSession
from ...db.models.resume import Resume
from ...db.models.user import User
from ...schemas.dashboard import DashboardSummary, ReadinessSummary
from ..deps import get_current_user, get_session


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)) -> DashboardSummary:
  resumes_count = await db.scalar(select(func.count()).select_from(Resume).where(Resume.user_id == user.id))
  avg_ats = await db.scalar(select(func.avg(Resume.ats_score)).where(Resume.user_id == user.id))
  interviews_answered = await db.scalar(
    select(func.count())
    .select_from(InterviewQA)
    .join(InterviewSession, InterviewSession.id == InterviewQA.session_id)
    .where(InterviewSession.user_id == user.id, InterviewQA.answer.is_not(None))
  )

  return DashboardSummary(
    xp=user.xp,
    streak_days=user.streak_days,
    resumes_analyzed=int(resumes_count or 0),
    avg_ats_score=float(avg_ats) if avg_ats is not None else None,
    interviews_answered=int(interviews_answered or 0),
  )


@router.get("/readiness", response_model=ReadinessSummary)
async def readiness(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)) -> ReadinessSummary:
  # Futuristic but deterministic readiness model (replace with ML later).
  resumes_count = int(await db.scalar(select(func.count()).select_from(Resume).where(Resume.user_id == user.id)) or 0)
  avg_ats = await db.scalar(select(func.avg(Resume.ats_score)).where(Resume.user_id == user.id))
  interviews_answered = int(
    await db.scalar(
      select(func.count())
      .select_from(InterviewQA)
      .join(InterviewSession, InterviewSession.id == InterviewQA.session_id)
      .where(InterviewSession.user_id == user.id, InterviewQA.answer.is_not(None))
    )
    or 0
  )

  base = min(100.0, user.xp / 6.0)
  ats = float(avg_ats) if avg_ats is not None else 45.0
  interview_score = min(100.0, 25 + interviews_answered * 6 + ats * 0.35)

  dsa_score = min(100.0, 20 + user.xp * 0.12 + interviews_answered * 2.0)
  aptitude_score = min(100.0, 30 + resumes_count * 5.0 + ats * 0.4)

  company = {
    "Google": round(min(100.0, 0.55 * dsa_score + 0.45 * interview_score), 1),
    "Microsoft": round(min(100.0, 0.45 * aptitude_score + 0.55 * interview_score), 1),
    "Amazon": round(min(100.0, 0.5 * aptitude_score + 0.5 * dsa_score), 1),
  }

  return ReadinessSummary(
    dsa_score=round(dsa_score, 1),
    aptitude_score=round(aptitude_score, 1),
    interview_score=round(interview_score, 1),
    company_readiness=company,
  )

