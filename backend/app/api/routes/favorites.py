from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Favorite, Listing, ListingStatus, User
from app.schemas.common import MessageResponse
from app.schemas.interactions import FavoriteView
from app.schemas.listings import ListingCard

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("", response_model=list[FavoriteView])
async def list_favorites(
    user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> list[FavoriteView]:
    rows = (
        await session.scalars(
            select(Favorite)
            .where(Favorite.user_id == user.id)
            .options(
                selectinload(Favorite.listing).selectinload(Listing.images),
                selectinload(Favorite.listing).selectinload(Listing.owner),
            )
            .order_by(Favorite.created_at.desc())
        )
    ).all()
    return [
        FavoriteView(id=row.id, listing=ListingCard.model_validate(row.listing), created_at=row.created_at)
        for row in rows
        if row.listing.status != ListingStatus.REMOVED
    ]


@router.post("/{listing_id}", response_model=MessageResponse, status_code=201)
async def add_favorite(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    listing = await session.scalar(select(Listing).where(Listing.id == listing_id))
    if not listing or listing.status == ListingStatus.REMOVED:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot favorite your own listing")
    if await session.scalar(
        select(Favorite.id).where(Favorite.user_id == user.id, Favorite.listing_id == listing_id)
    ):
        return MessageResponse(message="Already saved")
    session.add(Favorite(user_id=user.id, listing_id=listing_id))
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
    return MessageResponse(message="Listing saved")


@router.delete("/{listing_id}", response_model=MessageResponse)
async def remove_favorite(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    favorite = await session.scalar(
        select(Favorite).where(Favorite.user_id == user.id, Favorite.listing_id == listing_id)
    )
    if favorite:
        await session.delete(favorite)
        await session.commit()
    return MessageResponse(message="Listing removed from saved items")
