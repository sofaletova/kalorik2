from __future__ import annotations

from app.models.enums import ActivityLevel, Goal, Sex
from app.models.profile import UserProfile
from app.schemas.profile import NutritionTargets


ACTIVITY_MULTIPLIERS: dict[ActivityLevel, float] = {
    ActivityLevel.sedentary: 1.2,
    ActivityLevel.light: 1.375,
    ActivityLevel.moderate: 1.55,
    ActivityLevel.active: 1.725,
    ActivityLevel.very_active: 1.9,
}


def calculate_nutrition_targets(profile: UserProfile) -> NutritionTargets:
    sex_offset = 5 if profile.sex == Sex.male else -161
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + sex_offset
    tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level]

    calories = tdee
    if profile.goal == Goal.weight_loss:
        calories = tdee * 0.85
    elif profile.goal == Goal.muscle_gain:
        calories = tdee * 1.1

    protein_g = profile.weight_kg * (1.8 if profile.goal == Goal.muscle_gain else 1.6)
    fat_g = max(profile.weight_kg * 0.8, calories * 0.2 / 9)
    carbs_g = max((calories - protein_g * 4 - fat_g * 9) / 4, 0)

    return NutritionTargets(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        goal=profile.goal,
        calories=round(calories, 1),
        protein_g=round(protein_g, 1),
        fat_g=round(fat_g, 1),
        carbs_g=round(carbs_g, 1),
    )
