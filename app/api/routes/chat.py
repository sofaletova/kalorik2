from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_profile_or_404
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.enums import ChatRole
from app.models.profile import UserProfile
from app.schemas.chat import ChatMessageCreate, ChatMessageRead, ChatResponse
from app.services.chat import ChatServiceError, build_assistant_reply, build_food_image_reply

logger = logging.getLogger(__name__)
router = APIRouter()
MAX_IMAGE_BYTES = 8 * 1024 * 1024


@router.get("/profiles/{profile_id}/chat/messages", response_model=list[ChatMessageRead])
def get_chat_messages(
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> list[ChatMessage]:
    messages = db.scalars(
        select(ChatMessage)
        .where(ChatMessage.user_profile_id == profile.id)
        .order_by(ChatMessage.created_at)
    ).all()

    return list(messages)


@router.post(
    "/profiles/{profile_id}/chat/messages",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_chat_message(
    payload: ChatMessageCreate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> ChatResponse:
    history = list(
        reversed(
            db.scalars(
                select(ChatMessage)
                .where(ChatMessage.user_profile_id == profile.id)
                .order_by(ChatMessage.created_at.desc())
                .limit(12)
            ).all()
        )
    )

    try:
        assistant_content = build_assistant_reply(
            profile=profile,
            message=payload.content,
            history=history,
        )
    except ChatServiceError as exc:
        logger.exception("AI chat failed for profile_id=%s", profile.id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service is unavailable: {exc}",
        ) from exc

    user_message = ChatMessage(
        user_profile_id=profile.id,
        role=ChatRole.user,
        content=payload.content,
    )
    db.add(user_message)
    db.flush()

    assistant_message = ChatMessage(
        user_profile_id=profile.id,
        role=ChatRole.assistant,
        content=assistant_content,
    )
    db.add(assistant_message)

    db.commit()
    db.refresh(user_message)
    db.refresh(assistant_message)

    return ChatResponse(
        user_message=user_message,
        assistant_message=assistant_message,
    )


@router.post(
    "/profiles/{profile_id}/chat/image",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_chat_image_message(
    content: str = Form(default=""),
    image: UploadFile = File(...),
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> ChatResponse:
    image_content_type = image.content_type or ""
    if not image_content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Загрузите файл изображения.",
        )

    image_bytes = image.file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл изображения пустой.",
        )
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Фото слишком большое. Загрузите изображение до 8 МБ.",
        )

    history = list(
        reversed(
            db.scalars(
                select(ChatMessage)
                .where(ChatMessage.user_profile_id == profile.id)
                .order_by(ChatMessage.created_at.desc())
                .limit(12)
            ).all()
        )
    )

    user_content = "[Фото еды]"
    if content.strip():
        user_content += f" {content.strip()}"
    elif image.filename:
        user_content += f" {image.filename}"

    try:
        assistant_content = build_food_image_reply(
            profile=profile,
            message=content,
            image_bytes=image_bytes,
            image_content_type=image_content_type,
            history=history,
        )
    except ChatServiceError as exc:
        logger.exception("AI image analysis failed for profile_id=%s", profile.id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI image service is unavailable: {exc}",
        ) from exc

    user_message = ChatMessage(
        user_profile_id=profile.id,
        role=ChatRole.user,
        content=user_content,
    )
    db.add(user_message)
    db.flush()

    assistant_message = ChatMessage(
        user_profile_id=profile.id,
        role=ChatRole.assistant,
        content=assistant_content,
    )
    db.add(assistant_message)

    db.commit()
    db.refresh(user_message)
    db.refresh(assistant_message)

    return ChatResponse(
        user_message=user_message,
        assistant_message=assistant_message,
    )
