from __future__ import annotations

from pydantic import BaseModel


class NutritionValues(BaseModel):
    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
