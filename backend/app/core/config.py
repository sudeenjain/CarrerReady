from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=(".env", ".env.local"),
    env_ignore_empty=True,
    extra="ignore",
  )

  ENV: str = "dev"
  PROJECT_NAME: str = "CareerReady AI 2.0 API"
  API_V1_STR: str = "/api/v1"

  # Comma-separated supported via pydantic-settings; list in .env is also fine
  CORS_ORIGINS: list[str] = Field(
    default_factory=lambda: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]
  )

  DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/careerready"
  REDIS_URL: str = "redis://localhost:6379/0"

  JWT_SECRET: str = Field(default="CHANGE_ME_CHANGE_ME_CHANGE_ME", min_length=24)
  JWT_ISSUER: str = "careerready-ai-2.0"
  JWT_ACCESS_TTL_SECONDS: int = 60 * 30
  JWT_REFRESH_TTL_SECONDS: int = 60 * 60 * 24 * 14

  OPENAI_API_KEY: str | None = None
  OPENAI_MODEL: str = "gpt-4o-mini"

  # Simple API rate-limit (backed by Redis)
  RATE_LIMIT_PER_MINUTE: int = 120


settings = Settings()

