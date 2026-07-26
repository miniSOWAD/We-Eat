from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import (
    ExchangeRequest,
    ExchangeStatus,
    Listing,
    Order,
    OrderStatus,
    User,
)
from app.schemas.listings import ListingCard
from app.schemas.transactions import ProposalView
from app.schemas.users import UserPublic

router = APIRouter(prefix="/proposals", tags=["Proposals"])


def order_options():
    return (
        selectinload(Order.listing).selectinload(Listing.images),
        selectinload(Order.listing).selectinload(Listing.owner),
        selectinload(Order.requester),
    )


def exchange_options():
    return (
        selectinload(ExchangeRequest.listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.requester),
    )


def from_order(order: Order) -> ProposalView:
    return ProposalView(
        kind="ORDER",
        id=order.id,
        listing=ListingCard.model_validate(order.listing),
        requester=UserPublic.model_validate(order.requester),
        status=order.status.value,
        quantity=order.quantity,
        agreed_price=order.agreed_price,
        message=order.message,
        delivery_address=order.delivery_address,
        fulfillment_method=order.fulfillment_method,
        scheduled_for=order.scheduled_for,
        handoff_note=order.handoff_note,
        received_at=order.requester_confirmed_at,
        delivered_at=order.provider_confirmed_at,
        created_at=order.created_at,
    )


def from_exchange(row: ExchangeRequest) -> ProposalView:
    return ProposalView(
        kind="EXCHANGE",
        id=row.id,
        listing=ListingCard.model_validate(row.listing),
        requester=UserPublic.model_validate(row.requester),
        status=row.status.value,
        offered_listing=(
            ListingCard.model_validate(row.offered_listing)
            if row.offered_listing
            else None
        ),
        offered_description=row.offered_description,
        message=row.message,
        fulfillment_method=row.fulfillment_method,
        scheduled_for=row.scheduled_for,
        handoff_note=row.handoff_note,
        received_at=row.requester_confirmed_at,
        delivered_at=row.provider_confirmed_at,
        created_at=row.created_at,
    )


@router.get("/listing/{listing_id}", response_model=list[ProposalView])
async def listing_proposals(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ProposalView]:
    listing = await session.scalar(select(Listing).where(Listing.id == listing_id))
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the listing owner can view proposals")

    orders = (
        await session.scalars(
            select(Order)
            .where(
                Order.listing_id == listing_id,
                Order.status.in_(
                    [OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY]
                ),
            )
            .options(*order_options())
            .order_by(Order.created_at.desc())
        )
    ).all()
    exchanges = (
        await session.scalars(
            select(ExchangeRequest)
            .where(
                ExchangeRequest.listing_id == listing_id,
                ExchangeRequest.status.in_(
                    [ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED]
                ),
            )
            .options(*exchange_options())
            .order_by(ExchangeRequest.created_at.desc())
        )
    ).all()
    proposals = [
        *(from_order(item) for item in orders),
        *(from_exchange(item) for item in exchanges),
    ]
    return sorted(proposals, key=lambda item: item.created_at, reverse=True)


@router.get("/active", response_model=list[ProposalView])
async def active_handoffs(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ProposalView]:
    orders = (
        await session.scalars(
            select(Order)
            .where(
                Order.requester_id == user.id,
                Order.status.in_([OrderStatus.ACCEPTED, OrderStatus.READY]),
            )
            .options(*order_options())
            .order_by(Order.accepted_at.desc())
        )
    ).all()
    exchanges = (
        await session.scalars(
            select(ExchangeRequest)
            .where(
                ExchangeRequest.requester_id == user.id,
                ExchangeRequest.status == ExchangeStatus.ACCEPTED,
            )
            .options(*exchange_options())
            .order_by(ExchangeRequest.accepted_at.desc())
        )
    ).all()
    proposals = [
        *(from_order(item) for item in orders),
        *(from_exchange(item) for item in exchanges),
    ]
    return sorted(
        proposals,
        key=lambda item: item.scheduled_for or item.created_at,
    )
