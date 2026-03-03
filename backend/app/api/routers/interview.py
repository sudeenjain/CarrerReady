from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db.models.interview import InterviewQA, InterviewSession
from ...db.models.user import User
from ...schemas.interview import (
  InterviewAnswerRequest,
  InterviewAnswerResponse,
  InterviewNextQuestionResponse,
  InterviewQuestion,
  InterviewStartRequest,
  InterviewStartResponse,
)
from ...services.interview_engine import evaluate_answer, generate_question
from ...services.xp import award_xp
from ..deps import get_current_user, get_session


router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/sessions", response_model=InterviewStartResponse)
async def start_session(
  payload: InterviewStartRequest,
  user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_session),
) -> InterviewStartResponse:
  sess = InterviewSession(user_id=user.id, target_role=payload.target_role, mode=payload.mode)
  db.add(sess)
  await db.commit()
  await db.refresh(sess)
  return InterviewStartResponse(session_id=sess.id)


@router.post("/sessions/{session_id}/next", response_model=InterviewNextQuestionResponse)
async def next_question(
  session_id: str,
  user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_session),
) -> InterviewNextQuestionResponse:
  res = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id))
  sess = res.scalar_one_or_none()
  if not sess:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

  q = generate_question(target_role=sess.target_role)
  qa = InterviewQA(session_id=sess.id, question=q)
  db.add(qa)
  await db.commit()
  await db.refresh(qa)

  return InterviewNextQuestionResponse(question=InterviewQuestion(qa_id=qa.id, question=qa.question))


@router.post("/qas/{qa_id}/answer", response_model=InterviewAnswerResponse)
async def answer(
  qa_id: str,
  payload: InterviewAnswerRequest,
  user: User = Depends(get_current_user),
  db: AsyncSession = Depends(get_session),
) -> InterviewAnswerResponse:
  res = await db.execute(
    select(InterviewQA, InterviewSession)
    .join(InterviewSession, InterviewSession.id == InterviewQA.session_id)
    .where(InterviewQA.id == qa_id, InterviewSession.user_id == user.id)
  )
  row = res.first()
  if not row:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
  qa, sess = row

  eval_data = evaluate_answer(target_role=sess.target_role, question=qa.question, answer=payload.answer)

  qa.answer = payload.answer
  qa.score = float(eval_data.get("score", 0))
  qa.feedback_json = json.dumps(eval_data)
  db.add(qa)
  await db.commit()
  await db.refresh(qa)

  await award_xp(db=db, user=user, kind="interview_answered", points=15)

  return InterviewAnswerResponse(
    qa_id=qa.id,
    evaluation=eval_data,
  )

