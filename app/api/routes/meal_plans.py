from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_profile_or_404
from app.db.session import get_db
from app.models.meal_plan import MealPlan, MealPlanItem
from app.models.profile import UserProfile
from app.schemas.meal_plan import (
    MealPlanCreate,
    MealPlanItemRead,
    MealPlanItemUpdate,
    MealPlanRead,
)

router = APIRouter()


def build_plan_read(plan: MealPlan, db: Session) -> MealPlanRead:
    items = db.scalars(
        select(MealPlanItem)
        .where(MealPlanItem.meal_plan_id == plan.id)
        .order_by(MealPlanItem.plan_date, MealPlanItem.meal_type)
    ).all()
    return MealPlanRead(
        id=plan.id,
        user_profile_id=plan.user_profile_id,
        start_date=plan.start_date,
        end_date=plan.end_date,
        items=[MealPlanItemRead.model_validate(item) for item in items],
    )


@router.get("/profiles/{profile_id}/meal-plans", response_model=list[MealPlanRead])
def get_meal_plans(
    date_from: date = Query(...),
    date_to: date = Query(...),
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> list[MealPlanRead]:
    plans = db.scalars(
        select(MealPlan)
        .where(MealPlan.user_profile_id == profile.id)
        .where(MealPlan.start_date <= date_to)
        .where(MealPlan.end_date >= date_from)
        .order_by(MealPlan.start_date)
    ).all()
    return [build_plan_read(plan, db) for plan in plans]


@router.post("/profiles/{profile_id}/meal-plans", response_model=MealPlanRead, status_code=201)
def create_meal_plan(
    payload: MealPlanCreate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> MealPlanRead:
    plan = MealPlan(
        user_profile_id=profile.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(plan)
    db.flush()

    for item_payload in payload.items:
        db.add(MealPlanItem(meal_plan_id=plan.id, **item_payload.model_dump()))

    db.commit()
    db.refresh(plan)
    return build_plan_read(plan, db)


@router.patch(
    "/profiles/{profile_id}/meal-plans/items/{item_id}",
    response_model=MealPlanItemRead,
)
def update_meal_plan_item(
    item_id: int,
    payload: MealPlanItemUpdate,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> MealPlanItem:
    item = db.get(MealPlanItem, item_id)
    plan = db.get(MealPlan, item.meal_plan_id) if item is not None else None
    if item is None or plan is None or plan.user_profile_id != profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/profiles/{profile_id}/meal-plans/items/{item_id}", status_code=204)
def delete_meal_plan_item(
    item_id: int,
    profile: UserProfile = Depends(get_profile_or_404),
    db: Session = Depends(get_db),
) -> Response:
    item = db.get(MealPlanItem, item_id)
    plan = db.get(MealPlan, item.meal_plan_id) if item is not None else None
    if item is None or plan is None or plan.user_profile_id != profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan item not found")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
