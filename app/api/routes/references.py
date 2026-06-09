from __future__ import annotations

from fastapi import APIRouter

from app.schemas.references import OnboardingReferences, ReferenceItem

router = APIRouter()


@router.get("/references/onboarding", response_model=OnboardingReferences)
def get_onboarding_references() -> OnboardingReferences:
    return OnboardingReferences(
        goals=[
            ReferenceItem(id="weight_loss", label="Похудение"),
            ReferenceItem(id="muscle_gain", label="Набор массы"),
            ReferenceItem(id="maintenance", label="Поддержание формы"),
        ],
        allergies=[
            ReferenceItem(id="nuts", label="Орехи"),
            ReferenceItem(id="lactose", label="Лактоза"),
            ReferenceItem(id="gluten", label="Глютен"),
            ReferenceItem(id="seafood", label="Морепродукты"),
            ReferenceItem(id="eggs", label="Яйца"),
        ],
        religious_restrictions=[
            ReferenceItem(id="halal", label="Халяль"),
            ReferenceItem(id="kosher", label="Кошер"),
            ReferenceItem(id="hindu", label="Индуистские ограничения"),
        ],
        food_preferences=[
            ReferenceItem(id="chicken", label="Курица"),
            ReferenceItem(id="fish", label="Рыба"),
            ReferenceItem(id="vegetables", label="Овощи"),
            ReferenceItem(id="porridge", label="Каши"),
            ReferenceItem(id="soups", label="Супы"),
            ReferenceItem(id="asian", label="Азиатская кухня"),
            ReferenceItem(id="mediterranean", label="Средиземноморская кухня"),
            ReferenceItem(id="quick_meals", label="Быстрые блюда"),
        ],
        activity_levels=[
            ReferenceItem(id="sedentary", label="Мало активности"),
            ReferenceItem(id="light", label="Легкая активность"),
            ReferenceItem(id="moderate", label="Средняя активность"),
            ReferenceItem(id="active", label="Высокая активность"),
            ReferenceItem(id="very_active", label="Очень высокая активность"),
        ],
    )
