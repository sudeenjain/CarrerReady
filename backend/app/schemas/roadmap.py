from __future__ import annotations

import uuid
from datetime import datetime
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict

class ResourceLinkSchema(BaseModel):
  label: str
  url: str

class RoadmapDaySchema(BaseModel):
  id: Optional[uuid.UUID] = None
  day_number: int = Field(alias="day")
  phase: str
  primary_goal: str = Field(alias="primaryGoal")
  learning_task: str = Field(alias="learningTask")
  practice_task: str = Field(alias="practiceTask")
  building_task: str = Field(alias="buildingTask")
  review_task: str = Field(alias="reviewTask")
  expected_output: str = Field(alias="expectedOutput")
  time_estimate: str = Field(alias="timeEstimate")
  milestone: Optional[str] = None
  youtube_video_id: Optional[str] = Field(None, alias="youtubeVideoId")
  resource_links: Optional[List[ResourceLinkSchema]] = Field(None, alias="resourceLinks")
  difficulty: str
  points: int
  interview_questions: Optional[List[str]] = Field(None, alias="interviewQuestions")

  completion_status: Optional[Dict[str, bool]] = Field(default_factory=lambda: {"learn": False, "practice": False, "build": False, "review": False}, alias="completionStatus")
  watched_videos: Optional[List[str]] = Field(default_factory=list, alias="watchedVideos")
  notes: Optional[str] = None
  weak_topics: Optional[List[str]] = Field(default_factory=list, alias="weakTopics")

  model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RoadmapSchema(BaseModel):
  id: Optional[uuid.UUID] = None
  user_id: Optional[uuid.UUID] = None
  target_role: str = Field(alias="targetRole")
  streak: int = 0
  total_learning_hours: float = Field(0.0, alias="totalLearningHours")
  github_analysis: Optional[Dict[str, Any]] = Field(None, alias="githubAnalysis")
  ai_recommendations: Optional[Dict[str, Any]] = Field(None, alias="aiRecommendations")
  is_active: bool = Field(True, alias="isActive")
  days: List[RoadmapDaySchema]

  model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RoadmapProgressUpdate(BaseModel):
  completion_status: Optional[Dict[str, bool]] = Field(None, alias="completionStatus")
  watched_videos: Optional[List[str]] = Field(None, alias="watchedVideos")
  notes: Optional[str] = None
  weak_topics: Optional[List[str]] = Field(None, alias="weakTopics")

class YouTubeRecommendationResponse(BaseModel):
  video_id: str
  title: str
  thumbnail: str
  channel_title: str

class MentorChatRequest(BaseModel):
  topic: str
  query: str
  history: Optional[List[Dict[str, str]]] = []

class MentorChatResponse(BaseModel):
  response: str
