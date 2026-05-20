from __future__ import annotations

from fastapi import APIRouter, Depends

from ...db.models.user import User
from ...schemas.career import CareerPredictRequest, CareerPredictResponse
from ...services.career_predictor import predict_roles
from ..deps import get_current_user


router = APIRouter(prefix="/career", tags=["career"])


@router.post("/predict", response_model=CareerPredictResponse)
async def predict(payload: CareerPredictRequest, user: User = Depends(get_current_user)) -> CareerPredictResponse:
  recs = predict_roles(skills=payload.skills, profile_summary=payload.profile_summary)
  return CareerPredictResponse(recommendations=recs)

