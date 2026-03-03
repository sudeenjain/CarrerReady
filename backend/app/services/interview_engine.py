from __future__ import annotations

import json
import random
from typing import Any

from .openai_client import openai_service


QUESTION_BANK = {
  "Frontend Developer": [
    "Explain the difference between controlled and uncontrolled components in React.",
    "What is reconciliation in React and why do keys matter?",
    "How would you optimize a slow React page with many list items?",
  ],
  "Backend Developer": [
    "Design a rate limiter for an API. What data structures would you use?",
    "Explain transactions and isolation levels in PostgreSQL.",
    "How would you structure a FastAPI service for testability and scalability?",
  ],
}


def generate_question(*, target_role: str, difficulty: str = "mixed") -> str:
  if openai_service.enabled:
    schema = {
      "type": "object",
      "properties": {"question": {"type": "string"}},
      "required": ["question"],
      "additionalProperties": False,
    }
    data = openai_service.generate_json(
      instructions=(
        "Generate ONE interview question for the target role.\n"
        "Mix technical and practical questions. Keep it concise.\n"
        f"Difficulty: {difficulty}"
      ),
      input_text=f"Target role: {target_role}",
      schema=schema,
    )
    q = (data.get("question") or "").strip()
    if q:
      return q

  bank = QUESTION_BANK.get(target_role) or sum(QUESTION_BANK.values(), [])
  return random.choice(bank)


def evaluate_answer(*, target_role: str, question: str, answer: str) -> dict[str, Any]:
  if openai_service.enabled:
    schema = {
      "type": "object",
      "properties": {
        "score": {"type": "number"},
        "confidence": {"type": "number"},
        "feedback": {"type": "string"},
        "improvements": {"type": "array", "items": {"type": "string"}, "minItems": 3, "maxItems": 6},
      },
      "required": ["score", "confidence", "feedback", "improvements"],
      "additionalProperties": False,
    }
    data = openai_service.generate_json(
      instructions=(
        "You are an interview evaluator.\n"
        "Return a numeric score 0-10, confidence 0-1, 2-4 sentence feedback, and 3-6 improvements.\n"
        "Be strict but fair."
      ),
      input_text=f"Role: {target_role}\nQuestion: {question}\nAnswer: {answer}",
      schema=schema,
    )
    return data

  # Heuristic fallback
  length = len(answer.strip())
  score = min(10.0, max(1.0, length / 220))
  confidence = 0.35 if length < 200 else 0.6 if length < 600 else 0.75
  return {
    "score": round(score, 2),
    "confidence": confidence,
    "feedback": "Good start. Add more concrete details, trade-offs, and an example from experience.",
    "improvements": [
      "Give a structured answer (definition → approach → trade-offs → example).",
      "Add one real-world example or metric.",
      "Mention edge cases and how you’d test/validate.",
    ],
  }

