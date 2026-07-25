from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import (
    ExchangeRequest,
    ExchangeStatus,
    Listing,
    ListingStatus,
    ListingType,
    User,
)
from app.schemas.common import MessageResponse
from app.schemas.transactions import ExchangeCreate, ExchangeView

router = APIRouter(prefix="/exchanges", tags=["Exchanges"])


def exchange_options():
    return (
        selectinload(ExchangeRequest.listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.images),
        selectinload(ExchangeRequest.offered_listing).selectinload(Listing.owner),
        selectinload(ExchangeRequest.requester),
        selectinload(ExchangeRequest.provider),
    )


async def load_exchange(session: AsyncSession, exchange_id: UUID, *, lock: bool = False) -> ExchangeRequest:
    query = select(ExchangeRequest).where(ExchangeRequest.id == exchange_id)
    if lock:
        query = query.with_for_update()
    row = await session.scalar(query.options(*exchange_options()))
    if not row:
        raise HTTPException(status_code=404, detail="Exchange request not found")
    return row


@router.get("/mine", response_model=list[ExchangeView])
async def my_exchanges(
    user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> list[ExchangeView]:
    rows = (
        await session.scalars(
            select(ExchangeRequest)
            .where(
                or_(
                    ExchangeRequest.requester_id == user.id,
                    ExchangeRequest.provider_id == user.id,
                )
            )
            .options(*exchange_options())
            .order_by(ExchangeRequest.created_at.desc())
        )
    ).all()
    return [ExchangeView.model_validate(row) for row in rows]


@router.post("", response_model=ExchangeView, status_code=201)
async def create_exchange(
    payload: ExchangeCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ExchangeView:
    listing = await session.scalar(
        select(Listing).where(Listing.id == payload.listing_id).with_for_update()
    )
    if not listing or listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Listing is no longer available")
    if listing.listing_type != ListingType.EXCHANGE:
        raise HTTPException(status_code=400, detail="This listing does not accept exchanges")
    if listing.owner_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot exchange with yourself")

    offered = None
    if payload.offered_listing_id:
        offered = await session.scalar(
            select(Listing).where(Listing.id == payload.offered_listing_id)
        )
        if not offered or offered.owner_id != user.id:
            raise HTTPException(status_code=400, detail="Offered listing must belong to you")
        if offered.status != ListingStatus.ACTIVE:
            raise HTTPException(status_code=409, detail="Offered listing is unavailable")
        if offered.id == listing.id:
            raise HTTPException(status_code=400, detail="A listing cannot be exchanged with itself")

    existing = await session.scalar(
        select(ExchangeRequest.id).where(
            ExchangeRequest.listing_id == listing.id,
            ExchangeRequest.requester_id == user.id,
            ExchangeRequest.status.in_([ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED]),
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already have an active exchange request")

    row = ExchangeRequest(
        listing_id=listing.id,
        offered_listing_id=payload.offered_listing_id,
        requester_id=user.id,
        provider_id=listing.owner_id,
        offered_description=payload.offered_description,
        message=payload.message,
    )
    session.add(row)
    await session.commit()
    return ExchangeView.model_validate(await load_exchange(session, row.id))


@router.post("/{exchange_id}/accept", response_model=ExchangeView)
async def accept_exchange(
    exchange_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ExchangeView:
    row = await load_exchange(session, exchange_id, lock=True)
    if row.provider_id != user.id:
        raise HTTPException(status_code=403, detail="Only the provider can accept this exchange")
    if row.status != ExchangeStatus.PENDING:
        raise HTTPException(status_code=409, detail="Exchange cannot be accepted")
    target = await session.scalar(select(Listing).where(Listing.id == row.listing_id).with_for_update())
    if not target or target.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Target listing is unavailable")
    offered = None
    if row.offered_listing_id:
        offered = await session.scalar(
            select(Listing).where(Listing.id == row.offered_listing_id).with_for_update()
        )
        if not offered or offered.status != ListingStatus.ACTIVE:
            raise HTTPException(status_code=409, detail="Offered listing is unavailable")
    row.status = ExchangeStatus.ACCEPTED
    row.accepted_at = datetime.now(UTC)
    target.status = ListingStatus.RESERVED
    if offered:
        offered.status = ListingStatus.RESERVED
    await session.execute(
        update(ExchangeRequest)
        .where(
            ExchangeRequest.listing_id == row.listing_id,
            ExchangeRequest.id != row.id,
            ExchangeRequest.status == ExchangeStatus.PENDING,
        )
        .values(status=ExchangeStatus.REJECTED)
    )
    await session.commit()
    return ExchangeView.model_validate(await load_exchange(session, exchange_id))


@router.post("/{exchange_id}/reject", response_model=MessageResponse)
async def reject_exchange(
    exchange_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    row = await load_exchange(session, exchange_id, lock=True)
    if row.provider_id != user.id:
        raise HTTPException(status_code=403, detail="Only the provider can reject this exchange")
    if row.status != ExchangeStatus.PENDING:
        raise HTTPException(status_code=409, detail="Exchange cannot be rejected")
    row.status = ExchangeStatus.REJECTED
    await session.commit()
    return MessageResponse(message="Exchange rejected")


@router.post("/{exchange_id}/confirm-completion", response_model=ExchangeView)
async def confirm_exchange_completion(
    exchange_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ExchangeView:
    row = await load_exchange(session, exchange_id, lock=True)
    if user.id not in (row.requester_id, row.provider_id):
        raise HTTPException(status_code=403, detail="You are not part of this exchange")
    if row.status != ExchangeStatus.ACCEPTED:
        raise HTTPException(status_code=409, detail="Exchange cannot be completed")
    now = datetime.now(UTC)
    if user.id == row.requester_id:
        row.requester_confirmed_at = now
    else:
        row.provider_confirmed_at = now
    if row.requester_confirmed_at and row.provider_confirmed_at:
        row.status = ExchangeStatus.COMPLETED
        row.completed_at = now
        target = await session.scalar(
            select(Listing).where(Listing.id == row.listing_id).with_for_update()
        )
        if target:
            target.status = ListingStatus.COMPLETED
        if row.offered_listing_id:
            offered = await session.scalar(
                select(Listing).where(Listing.id == row.offered_listing_id).with_for_update()
            )
            if offered:
                offered.status = ListingStatus.COMPLETED
    await session.commit()
    return ExchangeView.model_validate(await load_exchange(session, exchange_id))


@router.post("/{exchange_id}/cancel", response_model=MessageResponse)
async def cancel_exchange(
    exchange_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    row = await load_exchange(session, exchange_id, lock=True)
    if user.id not in (row.requester_id, row.provider_id):
        raise HTTPException(status_code=403, detail="You are not part of this exchange")
    if row.status not in (ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED):
        raise HTTPException(status_code=409, detail="Exchange cannot be cancelled")
    was_accepted = row.status == ExchangeStatus.ACCEPTED
    row.status = ExchangeStatus.CANCELLED
    if was_accepted:
        ids = [row.listing_id]
        if row.offered_listing_id:
            ids.append(row.offered_listing_id)
        listings = (await session.scalars(select(Listing).where(Listing.id.in_(ids)).with_for_update())).all()
        for listing in listings:
            if listing.expires_at > datetime.now(UTC):
                listing.status = ListingStatus.ACTIVE
    await session.commit()
    return MessageResponse(message="Exchange cancelled")
