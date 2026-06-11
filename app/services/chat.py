from __future__ import annotations

import base64

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


def build_food_image_reply(
    profile: UserProfile,
    message: str,
    image_bytes: bytes,
    image_content_type: str,
    history: list[ChatMessage] | None = None,
) -> str:
    if settings.vision_provider.lower().strip() != "openai":
        raise ChatServiceError("Vision provider должен быть openai для анализа фото.")
    if not settings.openai_api_key:
        raise ChatServiceError(
            "OpenAI API key не задан. Добавьте OPENAI_API_KEY в Environment Variables на Render."
        )

    image_b64 = base64.b64encode(image_bytes).decode("ascii")
    image_url = f"data:{image_content_type};base64,{image_b64}"
    user_note = message.strip() or "Определи, что на фото, и примерно оцени КБЖУ блюда."

    client = OpenAI(api_key=settings.openai_api_key)
    system_prompt = f"""
Ты — AI-помощник продукта «КАЛОРИК» и анализируешь фото еды.

Задача:
- определить, что за блюдо или продукты на фото;
- дать примерную оценку калорий, белков, жиров и углеводов;
- указать, насколько оценка уверенная;
- если веса/состава не видно, честно написать, что это приблизительно;
- предложить, как уточнить расчёт;
- учитывать профиль, аллергии, религиозные ограничения и пищевые предпочтения.

Правила:
1. Отвечай на русском языке.
2. Пиши кратко и практично.
3. Не выдавай оценку как медицинскую рекомендацию.
4. Если по фото нельзя уверенно понять блюдо, попроси вес/состав/способ приготовления.
5. Не добавляй продукты в дневник сам — только дай анализ и предложи пользователю подтвердить.

{build_profile_context(profile)}
""".strip()

    history_text = "\n".join(
        f"{'Ассистент' if item.role == ChatRole.assistant else 'Пользователь'}: {item.content}"
        for item in (history or [])[-6:]
    )

    input_text = f"""
Комментарий пользователя:
{user_note}

Короткая история чата:
{history_text or "Истории пока нет."}

Верни ответ в таком формате:
1. Что вижу на фото
2. Примерная оценка КБЖУ
3. Что уточнить для точного расчёта
4. Как это вписать в день пользователя
""".strip()

    try:
        response = client.responses.create(
            model=settings.openai_vision_model,
            instructions=system_prompt,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": input_text},
                        {"type": "input_image", "image_url": image_url},
                    ],
                }
            ],
            max_output_tokens=700,
        )
    except Exception as exc:
        raise ChatServiceError(str(exc)) from exc

    text = (response.output_text or "").strip()
    if not text:
        raise ChatServiceError("OpenAI vision returned an empty response")
    return text


def build_assistant_reply(
    profile: UserProfile,
    message: str,
    history: list[ChatMessage] | None = None,
) -> str:
    provider = settings.llm_provider.lower().strip()

    if provider == "deepseek":
        return build_deepseek_assistant_reply(profile, message, history)

    return build_mock_assistant_reply(profile, message, history)
