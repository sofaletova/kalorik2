from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_profile_or_404
from app.db.session import get_db
from app.models.profile import UserProfile
from app.schemas.profile import (
    NutritionTargets,
    UserProfileCreate,
    UserProfileRead,
    UserProfileUpdate,
)
from app.services.nutrition import calculate_nutrition_targets

router = APIRouter()


@router.post("/profiles", response_model=UserProfileRead, status_code=201)
def create_profile(payload: UserProfileCreate, db: Session = Depends(get_db)) -> UserProfile:
    profile = UserProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/profiles/{profile_id}", response_model=UserProfileRead)
def get_profile(profile: UserProfile = Depends(get_profile_or_404)) -> UserProfile:
    return profile


@router.patch("/profiles/{profile_id}", response_model=UserProfileRead)
def update_profile(
    payload: UserProfileUpdate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> UserProfile:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/profiles/{profile_id}/nutrition-targets", response_model=NutritionTargets)
def get_nutrition_targets(profile: UserProfile = Depends(get_profile_or_404)) -> NutritionTargets:
    return calculate_nutrition_targets(profile)
