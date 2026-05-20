from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db.models.user import User, UserRole
from ...schemas.user import UserPublic, UserUpdate
from ..deps import get_current_user, get_session, require_role


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def me(user: User = Depends(get_current_user)) -> UserPublic:
  return UserPublic(
    id=user.id,
    email=user.email,
    full_name=user.full_name,
    role=user.role.value,
    target_role=user.target_role,
    xp=user.xp,
    streak_days=user.streak_days,
    created_at=user.created_at,
  )


@router.patch("/me", response_model=UserPublic)
async def update_me(
  payload: UserUpdate,
  user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_session),
) -> UserPublic:
  if payload.full_name is not None:
    user.full_name = payload.full_name
  if payload.target_role is not None:
    user.target_role = payload.target_role
  db.add(user)
  await db.commit()
  await db.refresh(user)
  return UserPublic(
    id=user.id,
    email=user.email,
    full_name=user.full_name,
    role=user.role.value,
    target_role=user.target_role,
    xp=user.xp,
    streak_days=user.streak_days,
    created_at=user.created_at,
  )


@router.get("", response_model=list[UserPublic])
async def list_users(
  _: User = Depends(require_role(UserRole.ADMIN)),
  db: AsyncSession = Depends(get_session),
) -> list[UserPublic]:
  res = await db.execute(select(User).order_by(User.created_at.desc()).limit(200))
  users = res.scalars().all()
  return [
    UserPublic(
      id=u.id,
      email=u.email,
      full_name=u.full_name,
      role=u.role.value,
      target_role=u.target_role,
      xp=u.xp,
      streak_days=u.streak_days,
      created_at=u.created_at,
    )
    for u in users
  ]

