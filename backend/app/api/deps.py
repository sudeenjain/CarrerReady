from __future__ import annotations

from collections.abc import AsyncIterator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.security import decode_token
from ..db.models.user import User, UserRole
from ..db.session import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_session() -> AsyncIterator[AsyncSession]:
  async for s in get_db():
    yield s


async def get_current_user(
  token: str = Depends(oauth2_scheme),
  db: AsyncSession = Depends(get_session),
) -> User:
  try:
    payload = decode_token(token)
  except JWTError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

  if payload.get("typ") != "access":
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

  user_id = payload.get("sub")
  if not user_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

  res = await db.execute(select(User).where(User.id == user_id))
  user = res.scalar_one_or_none()
  if not user or not user.is_active:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
  return user


def require_role(*roles: UserRole):
  async def _dep(user: User = Depends(get_current_user)) -> User:
    if user.role not in roles:
      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return user

  return _dep

