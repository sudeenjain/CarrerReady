from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import jwt
from jose.exceptions import JWTError
from passlib.context import CryptContext

from .config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
  return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)


def _now() -> datetime:
  return datetime.now(timezone.utc)


def create_token(*, subject: str, token_type: TokenType, ttl_seconds: int, extra: dict[str, Any] | None = None) -> tuple[str, str]:
  jti = str(uuid.uuid4())
  now = _now()
  payload: dict[str, Any] = {
    "iss": settings.JWT_ISSUER,
    "sub": subject,
    "iat": int(now.timestamp()),
    "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
    "jti": jti,
    "typ": token_type,
  }
  if extra:
    payload.update(extra)
  token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
  return token, jti


def create_access_token(*, subject: str, role: str) -> tuple[str, str]:
  return create_token(subject=subject, token_type="access", ttl_seconds=settings.JWT_ACCESS_TTL_SECONDS, extra={"role": role})


def create_refresh_token(*, subject: str) -> tuple[str, str]:
  # add a nonce to make refresh tokens unique even if iat same
  return create_token(subject=subject, token_type="refresh", ttl_seconds=settings.JWT_REFRESH_TTL_SECONDS, extra={"nonce": secrets.token_urlsafe(12)})


def decode_token(token: str) -> dict[str, Any]:
  return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"], issuer=settings.JWT_ISSUER)


def safe_decode_token(token: str) -> dict[str, Any] | None:
  try:
    return decode_token(token)
  except JWTError:
    return None

