from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.models.enums import MealType


class MealPlanItemBase(BaseModel):
    plan_date: date
    meal_type: MealType
    meal_name: str = Field(min_length=1, max_length=180)
    calories: float = Field(default=0, ge=0)
    protein_g: float = Field(default=0, ge=0)
    fat_g: float = Field(default=0, ge=0)
    carbs_g: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class MealPlanItemCreate(MealPlanItemBase):
    pass


class MealPlanItemUpdate(BaseModel):
    plan_date: Optional[date] = None
    meal_type: Optional[MealType] = None
    meal_name: Optional[str] = Field(default=None, min_length=1, max_length=180)
    calories: Optional[float] = Field(default=None, ge=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    fat_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None


class MealPlanItemRead(MealPlanItemBase):
    id: int
    meal_plan_id: int

    model_config = {"from_attributes": True}


class MealPlanCreate(BaseModel):
    start_date: date
    end_date: date
    items: list[MealPlanItemCreate] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_dates(self) -> "MealPlanCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class MealPlanRead(BaseModel):
    id: int
    user_profile_id: int
    start_date: date
    end_date: date
    items: list[MealPlanItemRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}
