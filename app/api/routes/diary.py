from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_profile_or_404
from app.db.session import get_db
from app.models.diary import FoodDiaryEntry
from app.models.profile import UserProfile
from app.schemas.diary import (
    DiaryDaySummary,
    FoodDiaryEntryCreate,
    FoodDiaryEntryRead,
    FoodDiaryEntryUpdate,
)

router = APIRouter()


@router.get("/profiles/{profile_id}/diary", response_model=DiaryDaySummary)
def get_diary_day(
    entry_date: date = Query(...),
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> DiaryDaySummary:
    entries = db.scalars(
        select(FoodDiaryEntry)
        .where(FoodDiaryEntry.user_profile_id == profile.id)
        .where(FoodDiaryEntry.entry_date == entry_date)
        .order_by(FoodDiaryEntry.created_at)
    ).all()

    return DiaryDaySummary(
        entry_date=entry_date,
        total_calories=sum(entry.calories for entry in entries),
        total_protein_g=sum(entry.protein_g for entry in entries),
        total_fat_g=sum(entry.fat_g for entry in entries),
        total_carbs_g=sum(entry.carbs_g for entry in entries),
        entries=list(entries),
    )


@router.post("/profiles/{profile_id}/diary", response_model=FoodDiaryEntryRead, status_code=201)
def create_diary_entry(
    payload: FoodDiaryEntryCreate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> FoodDiaryEntry:
    entry = FoodDiaryEntry(user_profile_id=profile.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/profiles/{profile_id}/diary/{entry_id}", response_model=FoodDiaryEntryRead)
def update_diary_entry(
    entry_id: int,
    payload: FoodDiaryEntryUpdate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> FoodDiaryEntry:
    entry = db.get(FoodDiaryEntry, entry_id)
    if entry is None or entry.user_profile_id != profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/profiles/{profile_id}/diary/{entry_id}", status_code=204)
def delete_diary_entry(
    entry_id: int,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> Response:
    entry = db.get(FoodDiaryEntry, entry_id)
    if entry is None or entry.user_profile_id != profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")
    db.delete(entry)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
