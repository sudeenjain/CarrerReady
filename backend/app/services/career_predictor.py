from __future__ import annotations

import math
from typing import Any

from .openai_client import openai_service


DEFAULT_ROLE_CATALOG = [
  {"role": "Frontend Developer", "keywords": ["react", "typescript", "javascript", "ui", "css", "tailwind", "frontend"]},
  {"role": "Backend Developer", "keywords": ["fastapi", "django", "node", "express", "postgres", "redis", "api", "backend"]},
  {"role": "Full Stack Developer", "keywords": ["react", "node", "fastapi", "postgres", "typescript", "full stack"]},
  {"role": "Data Analyst", "keywords": ["sql", "python", "pandas", "excel", "dashboard", "analysis"]},
  {"role": "ML Engineer", "keywords": ["machine learning", "scikit-learn", "ml", "nlp", "python", "models"]},
]


def _heuristic_predict(skills: list[str]) -> list[dict[str, Any]]:
  low = [s.lower() for s in skills]
  scores: list[tuple[str, float, str]] = []
  for r in DEFAULT_ROLE_CATALOG:
    hit = sum(1 for k in r["keywords"] if any(k in s for s in low))
    score = hit / max(1, len(r["keywords"]))
    reason = f"Matched {hit} core signals: " + ", ".join([k for k in r["keywords"] if any(k in s for s in low)][:6])
    scores.append((r["role"], score, reason))

  # softmax-ish normalization
  exps = [math.exp(s * 3) for _, s, _ in scores]
  denom = sum(exps) or 1.0
  out = []
  for (role, s, reason), e in zip(scores, exps):
    out.append({"role": role, "probability": round(e / denom, 3), "why": reason})
  out.sort(key=lambda x: x["probability"], reverse=True)
  return out[:5]


def predict_roles(*, skills: list[str], profile_summary: str | None = None) -> list[dict[str, Any]]:
  if openai_service.enabled:
    schema = {
      "type": "object",
      "properties": {
        "recommendations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "role": {"type": "string"},
              "probability": {"type": "number"},
              "why": {"type": "string"},
            },
            "required": ["role", "probability", "why"],
            "additionalProperties": False,
          },
          "minItems": 5,
          "maxItems": 5,
        }
      },
      "required": ["recommendations"],
      "additionalProperties": False,
    }

    data = openai_service.generate_json(
      instructions=(
        "You are CareerReady AI 2.0. Recommend exactly 5 career roles.\n"
        "Use the user's skills to assign a probability for each role (sum does not need to be 1).\n"
        "Explain the 'why' in one sentence per role."
      ),
      input_text=f"Skills: {skills}\nProfile: {profile_summary or ''}",
      schema=schema,
    )
    recs = data.get("recommendations") or []
    # normalize probabilities to 0..1 sum=1
    total = sum(max(0.0, float(r.get('probability', 0))) for r in recs) or 1.0
    normalized = [
      {"role": r["role"], "probability": round(max(0.0, float(r["probability"])) / total, 3), "why": r["why"]}
      for r in recs
    ]
    normalized.sort(key=lambda x: x["probability"], reverse=True)
    return normalized[:5]

  return _heuristic_predict(skills)

