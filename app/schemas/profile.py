from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import ActivityLevel, Goal, Sex
from app.schemas.common import NutritionValues


class UserProfileBase(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    goal: Goal
    sex: Sex
    activity_level: ActivityLevel
    age: int = Field(ge=10, le=120)
    weight_kg: float = Field(gt=20, lt=400)
    height_cm: float = Field(gt=100, lt=250)
    target_weight_kg: Optional[float] = Field(default=None, gt=20, lt=400)
    allergies: list[str] = Field(default_factory=list)
    religious_restrictions: list[str] = Field(default_factory=list)
    food_preferences: list[str] = Field(default_factory=list)


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    goal: Optional[Goal] = None
    sex: Optional[Sex] = None
    activity_level: Optional[ActivityLevel] = None
    age: Optional[int] = Field(default=None, ge=10, le=120)
    weight_kg: Optional[float] = Field(default=None, gt=20, lt=400)
    height_cm: Optional[float] = Field(default=None, gt=100, lt=250)
    target_weight_kg: Optional[float] = Field(default=None, gt=20, lt=400)
    allergies: Optional[list[str]] = None
    religious_restrictions: Optional[list[str]] = None
    food_preferences: Optional[list[str]] = None


class UserProfileRead(UserProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NutritionTargets(NutritionValues):
    bmr: float
    tdee: float
    goal: Goal
