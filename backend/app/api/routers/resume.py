from __future__ import annotations

import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...db.models.resume import Resume
from ...db.models.user import User
from ...schemas.resume import ResumeAnalyzeResponse
from ...services.ats import compute_ats_score
from ...services.resume_parser import extract_text_from_upload
from ...services.skill_extractor import extract_skills
from ...services.xp import award_xp
from ..deps import get_current_user, get_session


router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(
  file: UploadFile = File(...),
  user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_session),
) -> ResumeAnalyzeResponse:
  if not file.filename:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing filename")

  text = await extract_text_from_upload(file)
  if not text.strip():
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not extract text from document")

  skills = extract_skills(text)
  ats = compute_ats_score(text=text, skills=[s["name"] for s in skills])

  rec = Resume(
    user_id=user.id,
    filename=file.filename,
    content_type=file.content_type,
    extracted_text=text,
    ats_score=ats["ats_score"],
    industry_compatibility=ats["industry_compatibility"],
    suggestions_json=json.dumps(ats["suggestions"]),
    skills_json=json.dumps(skills),
  )
  db.add(rec)
  await db.commit()
  await db.refresh(rec)

  await award_xp(db=db, user=user, kind="resume_analyzed", points=40)

  return ResumeAnalyzeResponse(
    resume_id=rec.id,
    ats_score=ats["ats_score"],
    industry_compatibility=ats["industry_compatibility"],
    detected_skills=skills,
    suggestions=ats["suggestions"],
  )

