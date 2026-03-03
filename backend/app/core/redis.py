from __future__ import annotations

from typing import AsyncIterator

import redis.asyncio as redis

from .config import settings


_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
  global _redis
  if _redis is None:
    _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
  return _redis


async def lifespan_close_redis() -> None:
  global _redis
  if _redis is not None:
    await _redis.aclose()
    _redis = None

