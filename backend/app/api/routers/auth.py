from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...core.redis import get_redis
from ...core.security import (
  create_access_token,
  create_refresh_token,
  decode_token,
  hash_password,
  verify_password,
)
from ...db.models.user import User, UserRole
from ...schemas.auth import LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, TokenResponse
from ..deps import get_session


router = APIRouter(prefix="/auth", tags=["auth"])


def _refresh_key(jti: str) -> str:
  return f"auth:refresh:jti:{jti}"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_session)) -> TokenResponse:
  user = User(
    email=str(payload.email).lower(),
    hashed_password=hash_password(payload.password),
    full_name=payload.full_name,
    role=UserRole.STUDENT,
  )
  db.add(user)
  try:
    await db.commit()
  except IntegrityError:
    await db.rollback()
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

  await db.refresh(user)
  access, _ = create_access_token(subject=str(user.id), role=user.role.value)
  refresh, refresh_jti = create_refresh_token(subject=str(user.id))
  r = get_redis()
  await r.set(_refresh_key(refresh_jti), "1", ex=settings.JWT_REFRESH_TTL_SECONDS)
  return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_session)) -> TokenResponse:
  res = await db.execute(select(User).where(User.email == str(payload.email).lower()))
  user = res.scalar_one_or_none()
  if not user or not verify_password(payload.password, user.hashed_password):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")

  access, _ = create_access_token(subject=str(user.id), role=user.role.value)
  refresh, refresh_jti = create_refresh_token(subject=str(user.id))
  r = get_redis()
  await r.set(_refresh_key(refresh_jti), "1", ex=settings.JWT_REFRESH_TTL_SECONDS)
  return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_session)) -> TokenResponse:
  try:
    token_payload = decode_token(payload.refresh_token)
  except Exception:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

  if token_payload.get("typ") != "refresh":
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type")

  jti = token_payload.get("jti")
  sub = token_payload.get("sub")
  if not jti or not sub:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

  r = get_redis()
  if not await r.get(_refresh_key(str(jti))):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

  user_id = sub
  res = await db.execute(select(User).where(User.id == user_id))
  user = res.scalar_one_or_none()
  if not user or not user.is_active:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

  # rotate refresh token
  await r.delete(_refresh_key(str(jti)))
  access, _ = create_access_token(subject=str(user.id), role=user.role.value)
  new_refresh, new_jti = create_refresh_token(subject=str(user.id))
  await r.set(_refresh_key(new_jti), "1", ex=settings.JWT_REFRESH_TTL_SECONDS)
  return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: LogoutRequest) -> None:
  token_payload = decode_token(payload.refresh_token)
  if token_payload.get("typ") != "refresh":
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expected refresh token")
  jti = token_payload.get("jti")
  if not jti:
    return
  r = get_redis()
  await r.delete(_refresh_key(str(jti)))
  return None


@router.get("/limits", tags=["auth"])
async def limits():
  return {"rate_limit_per_minute": settings.RATE_LIMIT_PER_MINUTE}

