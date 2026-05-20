from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models.gamification import XPEvent
from ..db.models.user import User


async def award_xp(*, db: AsyncSession, user: User, kind: str, points: int) -> None:
  if points <= 0:
    return
  evt = XPEvent(user_id=user.id, kind=kind, points=points)
  user.xp += points
  db.add(evt)
  db.add(user)
  await db.commit()
  await db.refresh(user)

