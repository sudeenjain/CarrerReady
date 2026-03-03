from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse, PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from .api.routers import auth as auth_router
from .api.routers import career as career_router
from .api.routers import dashboard as dashboard_router
from .api.routers import gamification as gamification_router
from .api.routers import interview as interview_router
from .api.routers import resume as resume_router
from .api.routers import users as users_router
from .core.config import settings
from .core.logging import configure_logging, log
from .core.redis import lifespan_close_redis


@asynccontextmanager
async def lifespan(_: FastAPI):
  configure_logging(settings.ENV)
  log.info("api_starting", env=settings.ENV)
  yield
  await lifespan_close_redis()
  log.info("api_stopped")


app = FastAPI(
  title=settings.PROJECT_NAME,
  version="2.0.0",
  default_response_class=ORJSONResponse,
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.CORS_ORIGINS,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(users_router.router, prefix=settings.API_V1_STR)
app.include_router(resume_router.router, prefix=settings.API_V1_STR)
app.include_router(career_router.router, prefix=settings.API_V1_STR)
app.include_router(interview_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)
app.include_router(gamification_router.router, prefix=settings.API_V1_STR)


@app.get("/health", response_class=PlainTextResponse, tags=["health"])
async def health() -> str:
  return "ok"


@app.get("/metrics", tags=["metrics"])
async def metrics():
  data = generate_latest()
  return PlainTextResponse(content=data.decode("utf-8"), media_type=CONTENT_TYPE_LATEST)

