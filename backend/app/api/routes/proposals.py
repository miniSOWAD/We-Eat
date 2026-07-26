from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, select
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
from app.schemas.common import MessageResponse
from app.schemas.listings import ListingCard
from app.schemas.transactions import CancellationReviewRequest, ProposalView
from app.schemas.users import UserPublic
from app.services.transactions import review_cancellation

router = APIRouter(prefix="/proposals", tags=["Proposals"])


def order_options():
    return (
        selectinload(Order.listing).selectinload(Listing.images),
        selectinload(Order.listing).selectinload(Listing.owner),
        selectinload(Order.requester),
        selectinload(Order.provider),
    )


def exchange_options():
    return (
        selectinload(ExchangeRequest.listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.requester),
        selectinload(ExchangeRequest.provider),
    )


def cancellation_requires_review(row: Order | ExchangeRequest, viewer_id: UUID) -> bool:
    return bool(
        row.status in (OrderStatus.CANCELLED, ExchangeStatus.CANCELLED)
        and row.accepted_at
        and row.cancelled_by_id
        and row.cancelled_by_id != viewer_id
        and not row.cancellation_reviewed_at
    )


def from_order(order: Order, viewer_id: UUID) -> ProposalView:
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
        cancelled_by_id=order.cancelled_by_id,
        cancelled_at=order.cancelled_at,
        cancellation_note=order.cancellation_note,
        cancellation_requires_review=cancellation_requires_review(order, viewer_id),
        cancellation_marked=bool(order.cancellation_marked_at),
        rejection_reason=order.rejection_reason,
        requester_notice_seen_at=order.requester_notice_seen_at,
        created_at=order.created_at,
    )


def from_exchange(row: ExchangeRequest, viewer_id: UUID) -> ProposalView:
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
        cancelled_by_id=row.cancelled_by_id,
        cancelled_at=row.cancelled_at,
        cancellation_note=row.cancellation_note,
        cancellation_requires_review=cancellation_requires_review(row, viewer_id),
        cancellation_marked=bool(row.cancellation_marked_at),
        rejection_reason=row.rejection_reason,
        requester_notice_seen_at=row.requester_notice_seen_at,
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
                or_(
                    Order.status.in_([OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY]),
                    and_(
                        Order.status == OrderStatus.CANCELLED,
                        Order.accepted_at.is_not(None),
                        Order.cancelled_by_id == Order.requester_id,
                        Order.cancellation_reviewed_at.is_(None),
                    ),
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
                or_(
                    ExchangeRequest.status.in_([ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED]),
                    and_(
                        ExchangeRequest.status == ExchangeStatus.CANCELLED,
                        ExchangeRequest.accepted_at.is_not(None),
                        ExchangeRequest.cancelled_by_id == ExchangeRequest.requester_id,
                        ExchangeRequest.cancellation_reviewed_at.is_(None),
                    ),
                ),
            )
            .options(*exchange_options())
            .order_by(ExchangeRequest.created_at.desc())
        )
    ).all()
    proposals = [
        *(from_order(item, user.id) for item in orders),
        *(from_exchange(item, user.id) for item in exchanges),
    ]
    return sorted(proposals, key=lambda item: item.created_at, reverse=True)


@router.get("/mine", response_model=list[ProposalView])
async def my_proposal_statuses(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ProposalView]:
    orders = (
        await session.scalars(
            select(Order)
            .where(
                Order.requester_id == user.id,
                or_(
                    Order.status.in_([OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.READY]),
                    and_(
                        Order.status == OrderStatus.REJECTED,
                        Order.requester_notice_seen_at.is_(None),
                    ),
                    and_(
                        Order.status == OrderStatus.CANCELLED,
                        or_(Order.cancelled_by_id.is_(None), Order.cancelled_by_id != user.id),
                        Order.requester_notice_seen_at.is_(None),
                    ),
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
                ExchangeRequest.requester_id == user.id,
                or_(
                    ExchangeRequest.status.in_([ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED]),
                    and_(
                        ExchangeRequest.status == ExchangeStatus.REJECTED,
                        ExchangeRequest.requester_notice_seen_at.is_(None),
                    ),
                    and_(
                        ExchangeRequest.status == ExchangeStatus.CANCELLED,
                        or_(ExchangeRequest.cancelled_by_id.is_(None), ExchangeRequest.cancelled_by_id != user.id),
                        ExchangeRequest.requester_notice_seen_at.is_(None),
                    ),
                ),
            )
            .options(*exchange_options())
            .order_by(ExchangeRequest.created_at.desc())
        )
    ).all()
    proposals = [
        *(from_order(item, user.id) for item in orders),
        *(from_exchange(item, user.id) for item in exchanges),
    ]
    return sorted(proposals, key=lambda item: item.created_at, reverse=True)


@router.get("/active", response_model=list[ProposalView])
async def active_handoffs(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ProposalView]:
    """Backward-compatible accepted-only view used by older frontends."""
    items = await my_proposal_statuses(user, session)
    return [item for item in items if item.status in {"ACCEPTED", "READY"}]


async def load_transaction(
    session: AsyncSession,
    kind: str,
    proposal_id: UUID,
    *,
    lock: bool = True,
) -> Order | ExchangeRequest:
    normalized = kind.upper()
    if normalized == "ORDER":
        query = select(Order).where(Order.id == proposal_id)
        if lock:
            query = query.with_for_update()
        row = await session.scalar(query.options(*order_options()))
    elif normalized == "EXCHANGE":
        query = select(ExchangeRequest).where(ExchangeRequest.id == proposal_id)
        if lock:
            query = query.with_for_update()
        row = await session.scalar(query.options(*exchange_options()))
    else:
        raise HTTPException(status_code=400, detail="Unknown proposal type")
    if not row:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return row


@router.post("/{kind}/{proposal_id}/review-cancellation", response_model=MessageResponse)
async def review_cancelled_proposal(
    kind: str,
    proposal_id: UUID,
    payload: CancellationReviewRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    row = await load_transaction(session, kind, proposal_id)
    await review_cancellation(
        session,
        row,
        reviewer_id=user.id,
        action=payload.action,
    )
    await session.commit()
    return MessageResponse(
        message="Negative point added" if payload.action == "MARK" else "Cancellation acknowledged"
    )


@router.post("/{kind}/{proposal_id}/dismiss", response_model=MessageResponse)
async def dismiss_proposal_notice(
    kind: str,
    proposal_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    row = await load_transaction(session, kind, proposal_id)
    if row.requester_id != user.id:
        raise HTTPException(status_code=403, detail="Only the proposal maker can dismiss this notice")
    if row.status not in (OrderStatus.REJECTED, OrderStatus.CANCELLED, ExchangeStatus.REJECTED, ExchangeStatus.CANCELLED):
        raise HTTPException(status_code=409, detail="This proposal notice cannot be dismissed")
    if cancellation_requires_review(row, user.id):
        raise HTTPException(status_code=409, detail="Review the cancellation before dismissing it")
    from datetime import UTC, datetime

    row.requester_notice_seen_at = datetime.now(UTC)
    await session.commit()
    return MessageResponse(message="Notice dismissed")
