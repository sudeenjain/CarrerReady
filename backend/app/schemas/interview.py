from __future__ import annotations

import uuid
from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
  target_role: str = Field(min_length=2, max_length=120)
  mode: str = Field(default="text", max_length=16)


class InterviewStartResponse(BaseModel):
  session_id: uuid.UUID


class InterviewQuestion(BaseModel):
  qa_id: uuid.UUID
  question: str


class InterviewNextQuestionResponse(BaseModel):
  question: InterviewQuestion


class InterviewAnswerRequest(BaseModel):
  answer: str = Field(min_length=1, max_length=8000)


class InterviewFeedback(BaseModel):
  score: float
  confidence: float
  feedback: str
  improvements: list[str]


class InterviewAnswerResponse(BaseModel):
  qa_id: uuid.UUID
  evaluation: InterviewFeedback

