from __future__ import annotations

from pydantic import BaseModel


class ReferenceItem(BaseModel):
    id: str
    label: str


class OnboardingReferences(BaseModel):
    goals: list[ReferenceItem]
    allergies: list[ReferenceItem]
    religious_restrictions: list[ReferenceItem]
    food_preferences: list[ReferenceItem]
    activity_levels: list[ReferenceItem]
