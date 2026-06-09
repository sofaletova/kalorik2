from __future__ import annotations

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.profile import UserProfile


def get_profile_or_404(profile_id: int, db: Session = Depends(get_db)) -> UserProfile:
    profile = db.get(UserProfile, profile_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )
    return profile
