from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Nutrition Diary API"
    database_url: str = "sqlite:///./nutrition_diary.db"

    backend_cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"]
    )

    # AI-провайдер для обычного текстового чата: mock / openai
    llm_provider: str = "mock"

    # OpenAI для обычного чата
    openai_api_key: str | None = None
    openai_model: str = "gpt-5.4"

    # OpenAI Vision для анализа еды по фото
    vision_provider: str = "openai"
    openai_vision_model: str = "gpt-4.1-mini"
    max_food_photo_mb: int = 8

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
