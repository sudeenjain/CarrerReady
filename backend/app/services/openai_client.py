from __future__ import annotations

import json
from typing import Any

from openai import OpenAI

from ..core.config import settings


class OpenAIService:
  def __init__(self) -> None:
    self._client: OpenAI | None = None

  @property
  def enabled(self) -> bool:
    return bool(settings.OPENAI_API_KEY)

  def _get_client(self) -> OpenAI:
    if self._client is None:
      self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return self._client

  def generate_json(self, *, instructions: str, input_text: str, schema: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Best-effort JSON generation. If OPENAI_API_KEY isn't set, caller should not call this.
    """
    client = self._get_client()

    # Prefer Structured Outputs when schema provided (responses API).
    if schema is not None:
      resp = client.responses.create(
        model=settings.OPENAI_MODEL,
        instructions=instructions,
        input=input_text,
        response_format={
          "type": "json_schema",
          "json_schema": {
            "name": "careerready_schema",
            "schema": schema,
            "strict": True,
          },
        },
      )
      return json.loads(resp.output_text or "{}")

    resp = client.responses.create(
      model=settings.OPENAI_MODEL,
      instructions=instructions + "\nReturn ONLY valid JSON.",
      input=input_text,
    )
    return json.loads(resp.output_text or "{}")


openai_service = OpenAIService()

