from __future__ import annotations

from openai import OpenAI, OpenAIError

from app.core.config import settings
from app.models.chat import ChatMessage
from app.models.profile import UserProfile
from app.services.nutrition import calculate_nutrition_targets


class ChatServiceError(RuntimeError):
    pass


def _profile_context(profile: UserProfile) -> str:
    targets = calculate_nutrition_targets(profile)
    return (
        f"Профиль пользователя:\n"
        f"- цель: {profile.goal.value}\n"
        f"- пол: {profile.sex.value}\n"
        f"- возраст: {profile.age}\n"
        f"- вес: {profile.weight_kg} кг\n"
        f"- рост: {profile.height_cm} см\n"
        f"- активность: {profile.activity_level.value}\n"
        f"- целевой вес: {profile.target_weight_kg or 'не указан'}\n"
        f"- аллергии: {', '.join(profile.allergies or []) or 'нет'}\n"
        f"- религиозные ограничения: {', '.join(profile.religious_restrictions or []) or 'нет'}\n"
        f"- пищевые предпочтения: {', '.join(profile.food_preferences or []) or 'нет'}\n"
        f"- дневная цель: {targets.calories} ккал, белки {targets.protein_g} г, "
        f"жиры {targets.fat_g} г, углеводы {targets.carbs_g} г"
    )


def _history_context(history: list[ChatMessage]) -> str:
    if not history:
        return "Истории сообщений пока нет."
    lines = []
    for item in history[-12:]:
        role = "Пользователь" if item.role.value == "user" else "Ассистент"
        lines.append(f"{role}: {item.content}")
    return "\n".join(lines)


def build_assistant_reply(
    profile: UserProfile,
    message: str,
    history: list[ChatMessage],
) -> str:
    if not settings.openai_api_key:
        raise ChatServiceError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=settings.openai_api_key)
    instructions = (
        "Вы AI-помощник по питанию внутри приложения-дневника. Отвечайте на русском, "
        "на 'вы', спокойно и бережно. Помогайте оценивать блюда, планировать рацион и "
        "объяснять КБЖУ. Не ставьте медицинские диагнозы и не назначайте лечение. "
        "Если запрос связан с заболеванием, беременностью, РПП или опасным ограничением "
        "питания, мягко рекомендуйте обратиться к врачу или нутрициологу. "
        "Не предлагайте блюда, конфликтующие с аллергиями и религиозными ограничениями "
        "из профиля. Если данных для точной оценки блюда не хватает, попросите вес "
        "порции и способ приготовления, но всё равно можете дать аккуратную примерную оценку."
    )
    input_text = (
        f"{_profile_context(profile)}\n\n"
        f"Последняя история чата:\n{_history_context(history)}\n\n"
        f"Новое сообщение пользователя:\n{message}"
    )

    try:
        response = client.responses.create(
            model=settings.openai_model,
            instructions=instructions,
            input=input_text,
            max_output_tokens=700,
        )
    except OpenAIError as exc:
        raise ChatServiceError(str(exc)) from exc

    text = response.output_text.strip()
    if not text:
        raise ChatServiceError("OpenAI returned an empty response")
    return text
