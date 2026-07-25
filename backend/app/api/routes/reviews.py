from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import ExchangeRequest, ExchangeStatus, Order, OrderStatus, Review, User
from app.schemas.interactions import ReviewCreate, ReviewView

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def review_options():
    return (selectinload(Review.reviewer), selectinload(Review.reviewee))


@router.get("/user/{user_id}", response_model=list[ReviewView])
async def user_reviews(user_id: UUID, session: AsyncSession = Depends(get_db)) -> list[ReviewView]:
    rows = (
        await session.scalars(
            select(Review)
            .where(Review.reviewee_id == user_id)
            .options(*review_options())
            .order_by(Review.created_at.desc())
        )
    ).all()
    return [ReviewView.model_validate(row) for row in rows]


@router.get("/user/{user_id}/summary")
async def review_summary(user_id: UUID, session: AsyncSession = Depends(get_db)) -> dict:
    result = (
        await session.execute(
            select(func.count(Review.id), func.coalesce(func.avg(Review.rating), 0)).where(
                Review.reviewee_id == user_id
            )
        )
    ).one()
    return {"count": int(result[0]), "average": round(float(result[1]), 2)}


@router.post("", response_model=ReviewView, status_code=201)
async def create_review(
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ReviewView:
    if bool(payload.order_id) == bool(payload.exchange_request_id):
        raise HTTPException(status_code=400, detail="Choose exactly one completed transaction")

    reviewee_id: UUID
    if payload.order_id:
        transaction = await session.scalar(select(Order).where(Order.id == payload.order_id))
        if not transaction or transaction.status != OrderStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Only completed orders can be reviewed")
        if user.id not in (transaction.requester_id, transaction.provider_id):
            raise HTTPException(status_code=403, detail="You are not part of this order")
        reviewee_id = (
            transaction.provider_id if user.id == transaction.requester_id else transaction.requester_id
        )
    else:
        transaction = await session.scalar(
            select(ExchangeRequest).where(ExchangeRequest.id == payload.exchange_request_id)
        )
        if not transaction or transaction.status != ExchangeStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Only completed exchanges can be reviewed")
        if user.id not in (transaction.requester_id, transaction.provider_id):
            raise HTTPException(status_code=403, detail="You are not part of this exchange")
        reviewee_id = (
            transaction.provider_id if user.id == transaction.requester_id else transaction.requester_id
        )

    review = Review(
        reviewer_id=user.id,
        reviewee_id=reviewee_id,
        order_id=payload.order_id,
        exchange_request_id=payload.exchange_request_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    session.add(review)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=409, detail="You already reviewed this transaction") from exc
    review = await session.scalar(
        select(Review).where(Review.id == review.id).options(*review_options())
    )
    assert review
    return ReviewView.model_validate(review)
