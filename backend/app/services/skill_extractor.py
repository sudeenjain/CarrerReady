from __future__ import annotations

import re
from collections import Counter

from rapidfuzz import process, fuzz


# Curated baseline skills list (extend anytime)
SKILL_CANONICAL = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Python",
  "FastAPI",
  "Django",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Machine Learning",
  "NLP",
  "scikit-learn",
  "Pandas",
  "NumPy",
  "Git",
  "CI/CD",
  "Tailwind CSS",
]


def extract_skills(text: str) -> list[dict]:
  # Normalize text for scanning
  t = " ".join(text.split())
  low = t.lower()

  hits: list[str] = []

  # Direct keyword hits
  for skill in SKILL_CANONICAL:
    if re.search(rf"\\b{re.escape(skill.lower())}\\b", low):
      hits.append(skill)

  # Fuzzy match common variants (e.g., "js", "ts", "postgres")
  tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9\\+\\.#-]{1,30}", t)
  for tok in tokens[:2500]:
    tok_low = tok.lower()
    if tok_low in {"js", "javascript"}:
      hits.append("JavaScript")
    elif tok_low in {"ts", "typescript"}:
      hits.append("TypeScript")
    elif tok_low in {"postgres", "postgresql"}:
      hits.append("PostgreSQL")
    elif tok_low in {"k8s", "kubernetes"}:
      hits.append("Kubernetes")
    else:
      match = process.extractOne(tok, SKILL_CANONICAL, scorer=fuzz.WRatio)
      if match and match[1] >= 93:
        hits.append(match[0])

  counts = Counter(hits)

  def level_for(count: int) -> str:
    if count >= 4:
      return "Advanced"
    if count >= 2:
      return "Intermediate"
    return "Basic"

  result = [
    {"name": name, "mentions": counts[name], "level": level_for(counts[name])}
    for name in sorted(counts.keys(), key=lambda k: (-counts[k], k.lower()))
  ]
  return result[:50]

