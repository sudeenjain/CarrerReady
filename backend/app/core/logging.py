from __future__ import annotations

import logging
import sys

import structlog


def configure_logging(env: str) -> None:
  level = logging.INFO if env != "dev" else logging.DEBUG

  logging.basicConfig(
    level=level,
    stream=sys.stdout,
    format="%(message)s",
  )

  processors: list[structlog.types.Processor] = [
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso", utc=True),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.format_exc_info,
    structlog.processors.JSONRenderer(),
  ]

  structlog.configure(
    processors=processors,
    wrapper_class=structlog.make_filtering_bound_logger(level),
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
  )


log = structlog.get_logger()

