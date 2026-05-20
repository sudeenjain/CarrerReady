from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.config import settings
from ...db.session import get_db
from ...db.models.roadmap import Roadmap, RoadmapDay
from ...db.models.user import User
from ..deps import get_current_user
from ...schemas.roadmap import (
  RoadmapSchema, 
  RoadmapProgressUpdate, 
  YouTubeRecommendationResponse,
  MentorChatRequest,
  MentorChatResponse
)

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.get("/", response_model=RoadmapSchema)
async def get_roadmap(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
  result = await db.execute(
    select(Roadmap)
    .options(selectinload(Roadmap.days))
    .where(Roadmap.user_id == user.id, Roadmap.is_active == True)
    .order_by(Roadmap.created_at.desc())
  )
  roadmap = result.scalars().first()
  if not roadmap:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active roadmap found")
  return roadmap

@router.post("/", response_model=RoadmapSchema)
async def save_roadmap(payload: RoadmapSchema, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
  # Deactivate old roadmaps
  await db.execute(
    select(Roadmap).where(Roadmap.user_id == user.id).execution_options(synchronize_session=False)
  ) # To be correct, we should update is_active=False
  
  old_roadmaps = await db.execute(select(Roadmap).where(Roadmap.user_id == user.id))
  for old_rm in old_roadmaps.scalars():
      old_rm.is_active = False

  new_roadmap = Roadmap(
    user_id=user.id,
    target_role=payload.target_role,
    streak=payload.streak,
    total_learning_hours=payload.total_learning_hours,
    github_analysis=payload.github_analysis,
    ai_recommendations=payload.ai_recommendations,
  )
  db.add(new_roadmap)
  await db.flush() # get new_roadmap.id

  days_to_insert = []
  for day_data in payload.days:
    new_day = RoadmapDay(
      roadmap_id=new_roadmap.id,
      day_number=day_data.day_number,
      phase=day_data.phase,
      primary_goal=day_data.primary_goal,
      learning_task=day_data.learning_task,
      practice_task=day_data.practice_task,
      building_task=day_data.building_task,
      review_task=day_data.review_task,
      expected_output=day_data.expected_output,
      time_estimate=day_data.time_estimate,
      milestone=day_data.milestone,
      youtube_video_id=day_data.youtube_video_id,
      resource_links=[r.model_dump() for r in day_data.resource_links] if day_data.resource_links else None,
      difficulty=day_data.difficulty,
      points=day_data.points,
      interview_questions=day_data.interview_questions,
      completion_status=day_data.completion_status,
      watched_videos=day_data.watched_videos,
      notes=day_data.notes,
      weak_topics=day_data.weak_topics
    )
    days_to_insert.append(new_day)
  
  db.add_all(days_to_insert)
  await db.commit()
  await db.refresh(new_roadmap)
  return new_roadmap

@router.patch("/progress/{day_number}")
async def update_progress(
  day_number: int, 
  payload: RoadmapProgressUpdate, 
  user: User = Depends(get_current_user), 
  db: AsyncSession = Depends(get_db)
):
  result = await db.execute(
    select(Roadmap)
    .where(Roadmap.user_id == user.id, Roadmap.is_active == True)
    .order_by(Roadmap.created_at.desc())
  )
  roadmap = result.scalars().first()
  if not roadmap:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active roadmap found")
  
  day_result = await db.execute(
    select(RoadmapDay).where(RoadmapDay.roadmap_id == roadmap.id, RoadmapDay.day_number == day_number)
  )
  day = day_result.scalars().first()
  if not day:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
  
  if payload.completion_status is not None:
    day.completion_status = payload.completion_status
  if payload.watched_videos is not None:
    day.watched_videos = payload.watched_videos
  if payload.notes is not None:
    day.notes = payload.notes
  if payload.weak_topics is not None:
    day.weak_topics = payload.weak_topics

  # Recalculate streak / total_learning_hours if necessary
  # For now just save
  await db.commit()
  return {"status": "ok"}

@router.get("/youtube", response_model=YouTubeRecommendationResponse)
async def get_youtube_recommendation(topic: str):
  # Use Youtube Data API to search for topic
  # Wait, how to access env vars in python? Usually via settings
  import os
  api_key = os.getenv("YOUTUBE_API_KEY", "")
  if not api_key:
    raise HTTPException(status_code=500, detail="YouTube API key not configured")
  
  url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q={topic} tutorial beginner&type=video&key={api_key}"
  async with httpx.AsyncClient() as client:
    response = await client.get(url)
    if response.status_code == 200:
      data = response.json()
      items = data.get("items", [])
      if items:
        item = items[0]
        return YouTubeRecommendationResponse(
          video_id=item["id"]["videoId"],
          title=item["snippet"]["title"],
          thumbnail=item["snippet"]["thumbnails"]["high"]["url"],
          channel_title=item["snippet"]["channelTitle"]
        )
  raise HTTPException(status_code=404, detail="Video not found")

@router.post("/ai/mentor", response_model=MentorChatResponse)
async def chat_with_mentor(payload: MentorChatRequest):
  import os
  from ...services.openai_client import openai_client
  
  # Basic system prompt
  system_prompt = f"You are an Elite AI Career Mentor assisting a student with the topic: {payload.topic}. Be concise, professional, and practical."
  
  # Convert history to format OpenAI expects
  messages = [{"role": "system", "content": system_prompt}]
  if payload.history:
    for msg in payload.history:
      messages.append({"role": msg.get("role", "user"), "content": msg.get("text", "")})
      
  messages.append({"role": "user", "content": payload.query})
  
  try:
    response = await openai_client.chat(messages=messages, model="gpt-4o-mini")
    return MentorChatResponse(response=response)
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
