from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db.models.gamification import Badge, UserBadge
from ...db.models.user import User
from ...schemas.gamification import BadgePublic, LeaderboardEntry, LeaderboardResponse, MyGamification
from ..deps import get_current_user, get_session


router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def leaderboard(db: AsyncSession = Depends(get_session)) -> LeaderboardResponse:
  res = await db.execute(select(User).order_by(desc(User.xp)).limit(25))
  users = res.scalars().all()
  return LeaderboardResponse(
    entries=[
      LeaderboardEntry(rank=i + 1, user_id=u.id, name=(u.full_name or u.email.split("@")[0]), xp=u.xp)
      for i, u in enumerate(users)
    ]
  )


@router.get("/me", response_model=MyGamification)
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)) -> MyGamification:
  res = await db.execute(
    select(UserBadge, Badge)
    .join(Badge, Badge.id == UserBadge.badge_id)
    .where(UserBadge.user_id == user.id)
  )
  badges = [
    BadgePublic(code=b.code, name=b.name, description=b.description)
    for _, b in res.all()
  ]
  return MyGamification(xp=user.xp, streak_days=user.streak_days, badges=badges)

