from __future__ import annotations

from openai import OpenAI

from app.core.config import settings
from app.models.chat import ChatMessage
from app.models.enums import ChatRole
from app.models.profile import UserProfile


class ChatServiceError(Exception):
    """Ошибка при обращении к AI-провайдеру."""


def build_profile_context(profile: UserProfile) -> str:
    return f"""
Профиль пользователя:
- имя: {profile.name or "не указано"}
- цель: {profile.goal.value}
- пол: {profile.sex.value}
- возраст: {profile.age}
- вес: {profile.weight_kg} кг
- рост: {profile.height_cm} см
- активность: {profile.activity_level.value}
- аллергии: {", ".join(profile.allergies or []) or "нет"}
- религиозные ограничения: {", ".join(profile.religious_restrictions or []) or "нет"}
- пищевые предпочтения: {", ".join(profile.food_preferences or []) or "не указаны"}
""".strip()


def build_history_messages(history: list[ChatMessage] | None = None) -> list[dict[str, str]]:
    if not history:
        return []

    messages: list[dict[str, str]] = []

    for item in history:
        role = "assistant" if item.role == ChatRole.assistant else "user"
        messages.append(
            {
                "role": role,
                "content": item.content,
            }
        )

    return messages


def build_mock_assistant_reply(
    profile: UserProfile,
    message: str,
    history: list[ChatMessage] | None = None,
) -> str:
    return (
        "Это тестовый ответ backend. AI-провайдер пока не подключён. "
        "Проверьте LLM_PROVIDER и API-ключ в переменных окружения Render."
    )


def build_deepseek_assistant_reply(
    profile: UserProfile,
    message: str,
    history: list[ChatMessage] | None = None,
) -> str:
    if not settings.deepseek_api_key:
        raise ChatServiceError(
            "DeepSeek API key не задан. Добавьте DEEPSEEK_API_KEY в Environment Variables на Render."
        )

    client = OpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
    )

    system_prompt = f"""
Ты — AI-помощник продукта «КАЛОРИК».

Твоя задача — помогать пользователю с ежедневным выбором питания:
- объяснять КБЖУ простым языком;
- подсказывать варианты блюд;
- помогать скорректировать день после переедания;
- предлагать замены продуктов;
- учитывать цель, активность, ограничения и предпочтения пользователя.

Важные правила:
1. Отвечай на русском языке.
2. Пиши кратко, дружелюбно и практически полезно.
3. Не ставь диагнозы.
4. Не обещай гарантированное похудение или набор массы.
5. Не заменяй врача или диетолога.
6. При вопросах про заболевания, РПП, беременность, диабет или строгие медицинские ограничения советуй обратиться к врачу/диетологу.
7. Если пользователь спрашивает “что съесть”, предлагай 2–3 понятных варианта и объясняй, почему они подходят.

{build_profile_context(profile)}
""".strip()

    messages = [
        {"role": "system", "content": system_prompt},
        *build_history_messages(history),
        {"role": "user", "content": message},
    ]

    try:
        response = client.chat.completions.create(
            model=settings.deepseek_model,
            messages=messages,
            stream=False,
        )
    except Exception as exc:
        raise ChatServiceError(str(exc)) from exc

    return response.choices[0].message.content or "Не удалось сформировать ответ."


def build_assistant_reply(
    profile: UserProfile,
    message: str,
    history: list[ChatMessage] | None = None,
) -> str:
    provider = settings.llm_provider.lower().strip()

    if provider == "deepseek":
        return build_deepseek_assistant_reply(profile, message, history)

    return build_mock_assistant_reply(profile, message, history)
