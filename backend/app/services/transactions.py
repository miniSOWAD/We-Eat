from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    ExchangeRequest,
    ExchangeStatus,
    Listing,
    ListingStatus,
    Order,
    OrderStatus,
    User,
)

REJECTION_PROVIDER = "PROVIDER_REJECTED"
REJECTION_DELIVERED_ELSEWHERE = "DELIVERED_TO_SOMEONE_ELSE"
REJECTION_LISTING_REMOVED = "LISTING_REMOVED"


def cleaned_cancellation_note(note: str | None, *, required: bool) -> str | None:
    value = (note or "").strip()
    if required and len(value) < 8:
        raise HTTPException(
            status_code=400,
            detail="Please provide a short reason of at least 8 characters.",
        )
    return value or None


async def award_completion_points(
    session: AsyncSession,
    transaction: Order | ExchangeRequest,
    user_ids: tuple[UUID, UUID],
) -> None:
    if transaction.points_awarded_at:
        return
    now = datetime.now(UTC)
    await session.execute(
        update(User)
        .where(User.id.in_(set(user_ids)))
        .values(positive_points=User.positive_points + 1)
    )
    transaction.points_awarded_at = now


async def reject_competing_orders(
    session: AsyncSession,
    *,
    listing_id: UUID,
    selected_id: UUID,
    reason: str = REJECTION_DELIVERED_ELSEWHERE,
) -> None:
    now = datetime.now(UTC)
    await session.execute(
        update(Order)
        .where(
            Order.listing_id == listing_id,
            Order.id != selected_id,
            Order.status == OrderStatus.REQUESTED,
        )
        .values(
            status=OrderStatus.REJECTED,
            rejected_at=now,
            rejection_reason=reason,
            requester_notice_seen_at=None,
        )
    )


async def reject_competing_exchanges(
    session: AsyncSession,
    *,
    listing_id: UUID,
    selected_id: UUID,
    reason: str = REJECTION_DELIVERED_ELSEWHERE,
) -> None:
    now = datetime.now(UTC)
    await session.execute(
        update(ExchangeRequest)
        .where(
            ExchangeRequest.listing_id == listing_id,
            ExchangeRequest.id != selected_id,
            ExchangeRequest.status == ExchangeStatus.PENDING,
        )
        .values(
            status=ExchangeStatus.REJECTED,
            rejected_at=now,
            rejection_reason=reason,
            requester_notice_seen_at=None,
        )
    )


async def cancel_order_record(
    session: AsyncSession,
    order: Order,
    *,
    actor_id: UUID,
    note: str | None,
    reactivate_listing: bool = True,
) -> None:
    accepted = order.status in (OrderStatus.ACCEPTED, OrderStatus.READY)
    if order.status not in (OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY):
        raise HTTPException(status_code=409, detail="Order cannot be cancelled")

    now = datetime.now(UTC)
    order.status = OrderStatus.CANCELLED
    order.cancelled_by_id = actor_id
    order.cancelled_at = now
    order.cancellation_note = cleaned_cancellation_note(note, required=accepted)
    order.requester_notice_seen_at = None
    order.cancellation_reviewed_at = None if accepted else now
    order.cancellation_marked_at = None

    if accepted and reactivate_listing:
        listing = await session.scalar(
            select(Listing).where(Listing.id == order.listing_id).with_for_update()
        )
        if (
            listing
            and listing.status == ListingStatus.RESERVED
            and listing.expires_at > now
        ):
            listing.status = ListingStatus.ACTIVE


async def cancel_exchange_record(
    session: AsyncSession,
    row: ExchangeRequest,
    *,
    actor_id: UUID,
    note: str | None,
    reactivate_listings: bool = True,
) -> None:
    accepted = row.status == ExchangeStatus.ACCEPTED
    if row.status not in (ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED):
        raise HTTPException(status_code=409, detail="Exchange cannot be cancelled")

    now = datetime.now(UTC)
    row.status = ExchangeStatus.CANCELLED
    row.cancelled_by_id = actor_id
    row.cancelled_at = now
    row.cancellation_note = cleaned_cancellation_note(note, required=accepted)
    row.requester_notice_seen_at = None
    row.cancellation_reviewed_at = None if accepted else now
    row.cancellation_marked_at = None

    if accepted and reactivate_listings:
        ids = [row.listing_id]
        if row.offered_listing_id:
            ids.append(row.offered_listing_id)
        listings = (
            await session.scalars(
                select(Listing).where(Listing.id.in_(ids)).with_for_update()
            )
        ).all()
        for listing in listings:
            if listing.status == ListingStatus.RESERVED and listing.expires_at > now:
                listing.status = ListingStatus.ACTIVE


async def review_cancellation(
    session: AsyncSession,
    transaction: Order | ExchangeRequest,
    *,
    reviewer_id: UUID,
    action: Literal["MARK", "OK"],
) -> None:
    if transaction.status not in (OrderStatus.CANCELLED, ExchangeStatus.CANCELLED):
        raise HTTPException(status_code=409, detail="There is no cancellation to review")
    if not transaction.accepted_at or not transaction.cancelled_by_id:
        raise HTTPException(status_code=409, detail="This cancellation cannot be marked")
    if reviewer_id not in (transaction.requester_id, transaction.provider_id):
        raise HTTPException(status_code=403, detail="You are not part of this proposal")
    if reviewer_id == transaction.cancelled_by_id:
        raise HTTPException(status_code=403, detail="Only the affected user can review this cancellation")
    if transaction.cancellation_reviewed_at:
        raise HTTPException(status_code=409, detail="This cancellation has already been reviewed")

    now = datetime.now(UTC)
    if action == "MARK":
        await session.execute(
            update(User)
            .where(User.id == transaction.cancelled_by_id)
            .values(negative_points=User.negative_points + 1)
        )
        transaction.cancellation_marked_at = now
    transaction.cancellation_reviewed_at = now
    if reviewer_id == transaction.requester_id:
        transaction.requester_notice_seen_at = now
