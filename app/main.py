from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, diary, meal_plans, profiles, references
from app.core.config import settings
from app.db.session import Base, engine


Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(references.router, prefix="/api/v1", tags=["references"])
app.include_router(profiles.router, prefix="/api/v1", tags=["profiles"])
app.include_router(diary.router, prefix="/api/v1", tags=["diary"])
app.include_router(meal_plans.router, prefix="/api/v1", tags=["meal-plans"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
