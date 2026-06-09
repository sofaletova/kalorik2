from __future__ import annotations

from enum import Enum


class Goal(str, Enum):
    weight_loss = "weight_loss"
    muscle_gain = "muscle_gain"
    maintenance = "maintenance"


class Sex(str, Enum):
    female = "female"
    male = "male"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


class ChatRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"
