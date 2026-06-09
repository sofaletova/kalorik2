from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import ChatRole


class ChatMessageCreate(BaseModel):
    content: str = Field(min_length=1)


class ChatMessageRead(BaseModel):
    id: int
    user_profile_id: int
    role: ChatRole
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    user_message: ChatMessageRead
    assistant_message: ChatMessageRead
