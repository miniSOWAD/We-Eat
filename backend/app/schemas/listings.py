from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.models.models import ListingStatus, ListingType
from app.schemas.common import ORMModel
from app.schemas.users import UserPublic


class ListingImageInput(BaseModel):
    secure_url: str = Field(max_length=1000)
    public_id: str = Field(max_length=500)
    position: int = Field(default=0, ge=0, le=9)


class ListingImageView(ORMModel):
    id: UUID
    secure_url: str
    public_id: str
    position: int


class ListingPrivateInput(BaseModel):
    pickup_address: str = Field(min_length=5, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=30)
    delivery_notes: str | None = Field(default=None, max_length=500)


class ListingPrivateView(ORMModel):
    pickup_address: str
    contact_phone: str | None = None
    delivery_notes: str | None = None


class ListingCreate(BaseModel):
    listing_type: ListingType
    title: str = Field(min_length=4, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    category: str = Field(min_length=2, max_length=80)
    quantity: int = Field(gt=0, le=10000)
    unit: str = Field(min_length=1, max_length=40)
    original_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    discounted_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    exchange_for: str | None = Field(default=None, max_length=300)
    prepared_at: datetime | None = None
    expires_at: datetime
    city: str = Field(min_length=2, max_length=100)
    area: str = Field(min_length=2, max_length=100)
    is_vegetarian: bool = False
    allergens: str | None = Field(default=None, max_length=500)
    images: list[ListingImageInput] = Field(default_factory=list, min_length=1, max_length=6)
    private_details: ListingPrivateInput

    @model_validator(mode="after")
    def validate_type_fields(self) -> "ListingCreate":
        if self.listing_type == ListingType.DISCOUNTED and self.discounted_price is None:
            raise ValueError("discounted_price is required for discounted listings")
        if self.listing_type == ListingType.EXCHANGE and not self.exchange_for:
            raise ValueError("exchange_for is required for exchange listings")
        if self.expires_at <= datetime.now(self.expires_at.tzinfo):
            raise ValueError("expires_at must be in the future")
        return self


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=4, max_length=160)
    description: str | None = Field(default=None, min_length=10, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    quantity: int | None = Field(default=None, gt=0, le=10000)
    unit: str | None = Field(default=None, max_length=40)
    original_price: Decimal | None = Field(default=None, ge=0)
    discounted_price: Decimal | None = Field(default=None, ge=0)
    exchange_for: str | None = Field(default=None, max_length=300)
    prepared_at: datetime | None = None
    expires_at: datetime | None = None
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)
    is_vegetarian: bool | None = None
    allergens: str | None = Field(default=None, max_length=500)
    images: list[ListingImageInput] | None = Field(default=None, max_length=6)
    private_details: ListingPrivateInput | None = None


class ListingCard(ORMModel):
    id: UUID
    listing_type: ListingType
    status: ListingStatus
    title: str
    category: str
    quantity: int
    unit: str
    original_price: Decimal | None = None
    discounted_price: Decimal | None = None
    exchange_for: str | None = None
    expires_at: datetime
    city: str
    area: str
    is_vegetarian: bool
    images: list[ListingImageView] = Field(default_factory=list)
    owner: UserPublic
    proposal_count: int = 0
    created_at: datetime


class ListingDetail(ListingCard):
    description: str
    prepared_at: datetime | None = None
    allergens: str | None = None
    updated_at: datetime
    is_favorited: bool = False


class ListingOwnerDetail(ListingDetail):
    private_details: ListingPrivateView | None = None


class ListingBrowseResponse(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    page_size: int
    pages: int


class UploadResponse(BaseModel):
    secure_url: str
    public_id: str
    width: int | None = None
    height: int | None = None
    bytes: int | None = None
    format: str | None = None
