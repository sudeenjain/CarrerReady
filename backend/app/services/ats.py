from __future__ import annotations

import math
import re


def compute_ats_score(*, text: str, skills: list[str]) -> dict:
  low = text.lower()

  # Heuristics: section coverage, keyword density, formatting hygiene
  sections = {
    "education": bool(re.search(r"\\beducation\\b|\\bdegree\\b|\\buniversity\\b", low)),
    "experience": bool(re.search(r"\\bexperience\\b|\\bintern\\b|\\bwork\\b", low)),
    "projects": bool(re.search(r"\\bprojects\\b|\\bproject\\b|\\bgithub\\b", low)),
    "skills": bool(re.search(r"\\bskills\\b|\\btech\\b|\\btechnologies\\b", low)),
  }

  section_score = sum(sections.values()) / len(sections)  # 0..1

  # Skill coverage: more distinct skills => higher but capped
  distinct_skills = len(set(s.lower() for s in skills if s))
  skill_score = min(1.0, distinct_skills / 18.0)

  # Length signal: 250..1800 words is good
  words = re.findall(r"\\w+", text)
  wc = len(words)
  if wc <= 50:
    length_score = 0.1
  else:
    length_score = max(0.0, 1.0 - abs(wc - 900) / 900)

  # Penalty for too many symbols/garbage
  garbage_ratio = sum(1 for ch in text if ord(ch) < 9 or ord(ch) == 0xFFFD) / max(1, len(text))
  hygiene = max(0.0, 1.0 - garbage_ratio * 10)

  raw = 0.45 * section_score + 0.35 * skill_score + 0.15 * length_score + 0.05 * hygiene
  ats_score = round(raw * 100, 1)

  # Industry compatibility proxy: skills + section quality
  industry_compat = round(min(1.0, 0.6 * skill_score + 0.4 * section_score) * 100, 1)

  suggestions: list[str] = []
  if not sections["projects"]:
    suggestions.append("Add a dedicated Projects section with 2–4 projects, impact bullets, and links.")
  if not sections["experience"]:
    suggestions.append("Add Experience/Internship entries with quantified impact (%, latency, revenue, users).")
  if distinct_skills < 8:
    suggestions.append("Expand your Skills section with relevant tools (e.g., React, TypeScript, Postgres, Docker).")
  if wc < 250:
    suggestions.append("Your resume is too short; add 3–5 strong impact bullets per role/project.")
  if wc > 1800:
    suggestions.append("Your resume is too long; tighten bullets and remove low-signal content.")

  return {
    "ats_score": ats_score,
    "industry_compatibility": industry_compat,
    "suggestions": suggestions[:8],
  }

