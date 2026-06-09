from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class FoodDiaryEntryBase(BaseModel):
    entry_date: date
    meal_name: str = Field(min_length=1, max_length=180)
    calories: float = Field(default=0, ge=0)
    protein_g: float = Field(default=0, ge=0)
    fat_g: float = Field(default=0, ge=0)
    carbs_g: float = Field(default=0, ge=0)
    source: str = Field(default="manual", max_length=40)
    notes: Optional[str] = None


class FoodDiaryEntryCreate(FoodDiaryEntryBase):
    pass


class FoodDiaryEntryUpdate(BaseModel):
    entry_date: Optional[date] = None
    meal_name: Optional[str] = Field(default=None, min_length=1, max_length=180)
    calories: Optional[float] = Field(default=None, ge=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    fat_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    source: Optional[str] = Field(default=None, max_length=40)
    notes: Optional[str] = None


class FoodDiaryEntryRead(FoodDiaryEntryBase):
    id: int
    user_profile_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DiaryDaySummary(BaseModel):
    entry_date: date
    total_calories: float
    total_protein_g: float
    total_fat_g: float
    total_carbs_g: float
    entries: list[FoodDiaryEntryRead]
