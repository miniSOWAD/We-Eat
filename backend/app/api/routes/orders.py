from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import (
    Listing,
    ListingStatus,
    ListingType,
    Order,
    OrderStatus,
    User,
)
from app.schemas.common import MessageResponse
from app.schemas.transactions import OrderCreate, OrderView

router = APIRouter(prefix="/orders", tags=["Orders"])


def order_options():
    return (
        selectinload(Order.listing).selectinload(Listing.images),
        selectinload(Order.listing).selectinload(Listing.owner),
        selectinload(Order.requester),
        selectinload(Order.provider),
    )


async def load_order(session: AsyncSession, order_id: UUID, *, lock: bool = False) -> Order:
    query = select(Order).where(Order.id == order_id)
    if lock:
        query = query.with_for_update()
    order = await session.scalar(query.options(*order_options()))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/mine", response_model=list[OrderView])
async def my_orders(
    user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> list[OrderView]:
    rows = (
        await session.scalars(
            select(Order)
            .where(or_(Order.requester_id == user.id, Order.provider_id == user.id))
            .options(*order_options())
            .order_by(Order.created_at.desc())
        )
    ).all()
    return [OrderView.model_validate(row) for row in rows]


@router.post("", response_model=OrderView, status_code=201)
async def create_order(
    payload: OrderCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OrderView:
    listing = await session.scalar(
        select(Listing).where(Listing.id == payload.listing_id).with_for_update()
    )
    if not listing or listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Listing is no longer available")
    if listing.expires_at <= datetime.now(UTC):
        listing.status = ListingStatus.EXPIRED
        await session.commit()
        raise HTTPException(status_code=409, detail="Listing has expired")
    if listing.owner_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot request your own listing")
    if listing.listing_type == ListingType.EXCHANGE:
        raise HTTPException(status_code=400, detail="Use an exchange request for this listing")
    if payload.quantity > listing.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity is unavailable")
    existing = await session.scalar(
        select(Order.id).where(
            Order.listing_id == listing.id,
            Order.requester_id == user.id,
            Order.status.in_([OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY]),
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already have an active request")

    unit_price = listing.discounted_price if listing.listing_type == ListingType.DISCOUNTED else Decimal("0")
    order = Order(
        listing_id=listing.id,
        requester_id=user.id,
        provider_id=listing.owner_id,
        quantity=payload.quantity,
        agreed_price=(unit_price or Decimal("0")) * payload.quantity,
        fulfillment_method=payload.fulfillment_method,
        message=payload.message,
        delivery_address=payload.delivery_address,
    )
    session.add(order)
    await session.commit()
    order = await load_order(session, order.id)
    return OrderView.model_validate(order)


@router.post("/{order_id}/accept", response_model=OrderView)
async def accept_order(
    order_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OrderView:
    order = await load_order(session, order_id, lock=True)
    if order.provider_id != user.id:
        raise HTTPException(status_code=403, detail="Only the provider can accept this request")
    if order.status != OrderStatus.REQUESTED:
        raise HTTPException(status_code=409, detail="Order cannot be accepted")
    listing = await session.scalar(
        select(Listing).where(Listing.id == order.listing_id).with_for_update()
    )
    if not listing or listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Listing is no longer available")
    order.status = OrderStatus.ACCEPTED
    order.accepted_at = datetime.now(UTC)
    listing.status = ListingStatus.RESERVED
    await session.execute(
        update(Order)
        .where(
            Order.listing_id == order.listing_id,
            Order.id != order.id,
            Order.status == OrderStatus.REQUESTED,
        )
        .values(status=OrderStatus.REJECTED)
    )
    await session.commit()
    return OrderView.model_validate(await load_order(session, order_id))


@router.post("/{order_id}/reject", response_model=MessageResponse)
async def reject_order(
    order_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    order = await load_order(session, order_id, lock=True)
    if order.provider_id != user.id:
        raise HTTPException(status_code=403, detail="Only the provider can reject this request")
    if order.status != OrderStatus.REQUESTED:
        raise HTTPException(status_code=409, detail="Order cannot be rejected")
    order.status = OrderStatus.REJECTED
    await session.commit()
    return MessageResponse(message="Request rejected")


@router.post("/{order_id}/ready", response_model=OrderView)
async def mark_ready(
    order_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OrderView:
    order = await load_order(session, order_id, lock=True)
    if order.provider_id != user.id:
        raise HTTPException(status_code=403, detail="Only the provider can mark an order ready")
    if order.status != OrderStatus.ACCEPTED:
        raise HTTPException(status_code=409, detail="Order is not accepted")
    order.status = OrderStatus.READY
    await session.commit()
    return OrderView.model_validate(await load_order(session, order_id))


@router.post("/{order_id}/confirm-completion", response_model=OrderView)
async def confirm_completion(
    order_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OrderView:
    order = await load_order(session, order_id, lock=True)
    if user.id not in (order.requester_id, order.provider_id):
        raise HTTPException(status_code=403, detail="You are not part of this order")
    if order.status not in (OrderStatus.ACCEPTED, OrderStatus.READY):
        raise HTTPException(status_code=409, detail="Order cannot be completed")
    now = datetime.now(UTC)
    if user.id == order.requester_id:
        order.requester_confirmed_at = now
    else:
        order.provider_confirmed_at = now
    if order.requester_confirmed_at and order.provider_confirmed_at:
        order.status = OrderStatus.COMPLETED
        order.completed_at = now
        listing = await session.scalar(
            select(Listing).where(Listing.id == order.listing_id).with_for_update()
        )
        if listing:
            listing.status = ListingStatus.COMPLETED
    await session.commit()
    return OrderView.model_validate(await load_order(session, order_id))


@router.post("/{order_id}/cancel", response_model=MessageResponse)
async def cancel_order(
    order_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    order = await load_order(session, order_id, lock=True)
    if user.id not in (order.requester_id, order.provider_id):
        raise HTTPException(status_code=403, detail="You are not part of this order")
    if order.status not in (OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY):
        raise HTTPException(status_code=409, detail="Order cannot be cancelled")
    was_reserved = order.status in (OrderStatus.ACCEPTED, OrderStatus.READY)
    order.status = OrderStatus.CANCELLED
    if was_reserved:
        listing = await session.scalar(
            select(Listing).where(Listing.id == order.listing_id).with_for_update()
        )
        if listing and listing.expires_at > datetime.now(UTC):
            listing.status = ListingStatus.ACTIVE
    await session.commit()
    return MessageResponse(message="Order cancelled")
