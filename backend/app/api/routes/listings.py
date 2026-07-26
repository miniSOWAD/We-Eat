from __future__ import annotations

import math
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_optional_user
from app.core.config import settings
from app.db.session import get_db
from app.models.models import (
    ExchangeRequest,
    ExchangeStatus,
    Favorite,
    Listing,
    ListingImage,
    ListingPrivateDetails,
    ListingStatus,
    ListingType,
    Order,
    OrderStatus,
    User,
    UserRole,
)
from app.schemas.common import MessageResponse
from app.schemas.listings import (
    ListingBrowseResponse,
    ListingCard,
    ListingCreate,
    ListingDetail,
    ListingOwnerDetail,
    ListingPrivateView,
    ListingUpdate,
    UploadResponse,
)
from app.services.audit import write_audit
from app.services.cloudinary import upload_image

router = APIRouter(prefix="/listings", tags=["Listings"])


def listing_options():
    return (selectinload(Listing.images), selectinload(Listing.owner))


async def proposal_counts(
    session: AsyncSession, listing_ids: list[UUID]
) -> dict[UUID, int]:
    if not listing_ids:
        return {}

    totals: dict[UUID, int] = {listing_id: 0 for listing_id in listing_ids}
    order_rows = (
        await session.execute(
            select(Order.listing_id, func.count(Order.id))
            .where(
                Order.listing_id.in_(listing_ids),
                Order.status == OrderStatus.REQUESTED,
            )
            .group_by(Order.listing_id)
        )
    ).all()
    exchange_rows = (
        await session.execute(
            select(ExchangeRequest.listing_id, func.count(ExchangeRequest.id))
            .where(
                ExchangeRequest.listing_id.in_(listing_ids),
                ExchangeRequest.status == ExchangeStatus.PENDING,
            )
            .group_by(ExchangeRequest.listing_id)
        )
    ).all()
    for listing_id, count in [*order_rows, *exchange_rows]:
        totals[listing_id] = totals.get(listing_id, 0) + int(count)
    return totals


def to_card(listing: Listing, proposal_count: int = 0) -> ListingCard:
    return ListingCard.model_validate(listing).model_copy(
        update={"proposal_count": proposal_count}
    )


def to_owner_detail(listing: Listing, proposal_count: int = 0) -> ListingOwnerDetail:
    return ListingOwnerDetail.model_validate(listing).model_copy(
        update={"proposal_count": proposal_count}
    )


def validate_uploaded_images(images: list, user_id: UUID) -> None:
    if not settings.cloudinary_is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudinary is not configured",
        )
    expected_host = f"res.cloudinary.com/{settings.effective_cloudinary_cloud_name}/"
    expected_prefix = f"{settings.cloudinary_folder}/listings/{user_id}"
    for image in images:
        if expected_host not in image.secure_url or not image.public_id.startswith(expected_prefix):
            raise HTTPException(status_code=400, detail="Image does not belong to this user upload")


@router.get("", response_model=ListingBrowseResponse)
async def browse_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    listing_type: ListingType | None = None,
    category: str | None = Query(None, max_length=80),
    city: str | None = Query(None, max_length=100),
    search: str | None = Query(None, max_length=120),
    vegetarian: bool | None = None,
    session: AsyncSession = Depends(get_db),
) -> ListingBrowseResponse:
    conditions = [
        Listing.status == ListingStatus.ACTIVE,
        Listing.expires_at > datetime.now(UTC),
    ]
    if listing_type:
        conditions.append(Listing.listing_type == listing_type)
    if category:
        conditions.append(func.lower(Listing.category) == category.lower())
    if city:
        conditions.append(func.lower(Listing.city) == city.lower())
    if vegetarian is not None:
        conditions.append(Listing.is_vegetarian == vegetarian)
    if search:
        term = f"%{search.strip()}%"
        conditions.append(or_(Listing.title.ilike(term), Listing.description.ilike(term)))

    total = int(await session.scalar(select(func.count(Listing.id)).where(*conditions)) or 0)
    rows = (
        await session.scalars(
            select(Listing)
            .where(*conditions)
            .options(*listing_options())
            .order_by(Listing.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    counts = await proposal_counts(session, [item.id for item in rows])
    return ListingBrowseResponse(
        items=[to_card(item, counts.get(item.id, 0)) for item in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/mine", response_model=list[ListingOwnerDetail])
async def my_listings(
    user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> list[ListingOwnerDetail]:
    rows = (
        await session.scalars(
            select(Listing)
            .where(Listing.owner_id == user.id)
            .options(*listing_options(), selectinload(Listing.private_details))
            .order_by(Listing.created_at.desc())
        )
    ).all()
    counts = await proposal_counts(session, [row.id for row in rows])
    return [to_owner_detail(row, counts.get(row.id, 0)) for row in rows]


@router.post("/upload", response_model=UploadResponse, status_code=201)
async def upload_listing_image(
    file: UploadFile = File(...), user: User = Depends(get_current_user)
) -> UploadResponse:
    result = await upload_image(file, owner_id=str(user.id), resource_group="listings")
    return UploadResponse(**result)


@router.post("", response_model=ListingOwnerDetail, status_code=201)
async def create_listing(
    payload: ListingCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ListingOwnerDetail:
    validate_uploaded_images(payload.images, user.id)
    listing = Listing(
        owner_id=user.id,
        listing_type=payload.listing_type,
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category.strip(),
        quantity=payload.quantity,
        unit=payload.unit.strip(),
        original_price=payload.original_price,
        discounted_price=payload.discounted_price,
        exchange_for=payload.exchange_for,
        prepared_at=payload.prepared_at,
        expires_at=payload.expires_at,
        city=payload.city.strip(),
        area=payload.area.strip(),
        is_vegetarian=payload.is_vegetarian,
        allergens=payload.allergens,
    )
    listing.images = [
        ListingImage(
            secure_url=image.secure_url, public_id=image.public_id, position=image.position
        )
        for image in sorted(payload.images, key=lambda item: item.position)
    ]
    listing.private_details = ListingPrivateDetails(**payload.private_details.model_dump())
    session.add(listing)
    await session.commit()

    listing = await session.scalar(
        select(Listing)
        .where(Listing.id == listing.id)
        .options(*listing_options(), selectinload(Listing.private_details))
    )
    assert listing
    return to_owner_detail(listing, 0)


@router.get("/{listing_id}", response_model=ListingDetail)
async def get_listing(
    listing_id: UUID,
    user: User | None = Depends(get_optional_user),
    session: AsyncSession = Depends(get_db),
) -> ListingDetail:
    listing = await session.scalar(
        select(Listing).where(Listing.id == listing_id).options(*listing_options())
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    privileged = bool(
        user and (user.id == listing.owner_id or user.role in (UserRole.MODERATOR, UserRole.ADMIN))
    )
    if listing.status == ListingStatus.REMOVED and not privileged:
        raise HTTPException(status_code=404, detail="Listing not found")

    favorited = False
    if user:
        favorited = bool(
            await session.scalar(
                select(Favorite.id).where(
                    Favorite.user_id == user.id, Favorite.listing_id == listing.id
                )
            )
        )
    count = (await proposal_counts(session, [listing.id])).get(listing.id, 0)
    data = ListingDetail.model_validate(listing).model_dump()
    data["is_favorited"] = favorited
    data["proposal_count"] = count
    return ListingDetail(**data)


@router.patch("/{listing_id}", response_model=ListingOwnerDetail)
async def update_listing(
    listing_id: UUID,
    payload: ListingUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ListingOwnerDetail:
    listing = await session.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(*listing_options(), selectinload(Listing.private_details))
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if user.id != listing.owner_id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You cannot edit this listing")
    if listing.status not in (ListingStatus.ACTIVE, ListingStatus.EXPIRED):
        raise HTTPException(status_code=409, detail="Reserved or completed listings cannot be edited")

    changes = payload.model_dump(exclude_unset=True)
    images = changes.pop("images", None)
    private = changes.pop("private_details", None)
    if images is not None:
        validate_uploaded_images(payload.images or [], listing.owner_id)
        listing.images.clear()
        listing.images.extend(
            ListingImage(**image.model_dump())
            for image in sorted(payload.images or [], key=lambda item: item.position)
        )
    if private is not None:
        if listing.private_details:
            for key, value in private.items():
                setattr(listing.private_details, key, value)
        else:
            listing.private_details = ListingPrivateDetails(**private)
    for key, value in changes.items():
        setattr(listing, key, value)
    if listing.expires_at > datetime.now(UTC) and listing.status == ListingStatus.EXPIRED:
        listing.status = ListingStatus.ACTIVE
    await session.commit()

    listing = await session.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(*listing_options(), selectinload(Listing.private_details))
    )
    assert listing
    count = (await proposal_counts(session, [listing.id])).get(listing.id, 0)
    return to_owner_detail(listing, count)


@router.delete("/{listing_id}", response_model=MessageResponse)
async def remove_listing(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    listing = await session.scalar(select(Listing).where(Listing.id == listing_id).with_for_update())
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if user.id != listing.owner_id and user.role not in (UserRole.MODERATOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="You cannot remove this listing")
    listing.status = ListingStatus.REMOVED
    if user.id != listing.owner_id:
        await write_audit(
            session,
            actor_id=user.id,
            action="LISTING_REMOVED",
            target_type="LISTING",
            target_id=listing.id,
        )
    await session.commit()
    return MessageResponse(message="Listing removed")


@router.get("/{listing_id}/pickup-details", response_model=ListingPrivateView)
async def get_pickup_details(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ListingPrivateView:
    listing = await session.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.private_details))
    )
    if not listing or not listing.private_details:
        raise HTTPException(status_code=404, detail="Pickup details not found")

    authorized = user.id == listing.owner_id or user.role in (UserRole.MODERATOR, UserRole.ADMIN)
    if not authorized:
        authorized = bool(
            await session.scalar(
                select(Order.id).where(
                    Order.listing_id == listing_id,
                    or_(Order.requester_id == user.id, Order.provider_id == user.id),
                    Order.status.in_([OrderStatus.ACCEPTED, OrderStatus.READY, OrderStatus.COMPLETED]),
                )
            )
        )
    if not authorized:
        authorized = bool(
            await session.scalar(
                select(ExchangeRequest.id).where(
                    or_(
                        ExchangeRequest.listing_id == listing_id,
                        ExchangeRequest.offered_listing_id == listing_id,
                    ),
                    or_(
                        ExchangeRequest.requester_id == user.id,
                        ExchangeRequest.provider_id == user.id,
                    ),
                    ExchangeRequest.status.in_([ExchangeStatus.ACCEPTED, ExchangeStatus.COMPLETED]),
                )
            )
        )
    if not authorized:
        raise HTTPException(status_code=403, detail="Pickup details are private")
    return ListingPrivateView.model_validate(listing.private_details)
