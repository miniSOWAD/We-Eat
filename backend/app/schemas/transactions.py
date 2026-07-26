from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.models.models import ExchangeStatus, FulfillmentMethod, OrderStatus
from app.schemas.common import ORMModel
from app.schemas.listings import ListingCard
from app.schemas.users import UserPublic


class OrderCreate(BaseModel):
    listing_id: UUID
    quantity: int = Field(gt=0, le=10000)
    fulfillment_method: FulfillmentMethod
    message: str | None = Field(default=None, max_length=500)
    delivery_address: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_delivery(self) -> "OrderCreate":
        if self.fulfillment_method == FulfillmentMethod.DELIVERY and not self.delivery_address:
            raise ValueError("delivery_address is required when delivery is preferred")
        return self


class HandoffDecision(BaseModel):
    fulfillment_method: FulfillmentMethod
    scheduled_for: datetime
    handoff_note: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_schedule(self) -> "HandoffDecision":
        value = self.scheduled_for
        if value.tzinfo is None:
            raise ValueError("scheduled_for must include a timezone")
        if value <= datetime.now(UTC):
            raise ValueError("scheduled_for must be in the future")
        return self


class OrderView(ORMModel):
    id: UUID
    listing: ListingCard
    requester: UserPublic
    provider: UserPublic
    status: OrderStatus
    quantity: int
    agreed_price: Decimal
    fulfillment_method: FulfillmentMethod
    message: str | None = None
    delivery_address: str | None = None
    scheduled_for: datetime | None = None
    handoff_note: str | None = None
    requester_confirmed_at: datetime | None = None
    provider_confirmed_at: datetime | None = None
    accepted_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ExchangeCreate(BaseModel):
    listing_id: UUID
    offered_listing_id: UUID | None = None
    offered_description: str | None = Field(default=None, max_length=500)
    message: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_offer(self) -> "ExchangeCreate":
        if not self.offered_listing_id and not self.offered_description:
            raise ValueError("Provide an offered listing or a description")
        return self


class ExchangeView(ORMModel):
    id: UUID
    listing: ListingCard
    offered_listing: ListingCard | None = None
    requester: UserPublic
    provider: UserPublic
    status: ExchangeStatus
    offered_description: str | None = None
    message: str | None = None
    fulfillment_method: FulfillmentMethod | None = None
    scheduled_for: datetime | None = None
    handoff_note: str | None = None
    requester_confirmed_at: datetime | None = None
    provider_confirmed_at: datetime | None = None
    accepted_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ProposalView(BaseModel):
    kind: Literal["ORDER", "EXCHANGE"]
    id: UUID
    listing: ListingCard
    requester: UserPublic
    status: str
    quantity: int | None = None
    agreed_price: Decimal | None = None
    offered_listing: ListingCard | None = None
    offered_description: str | None = None
    message: str | None = None
    delivery_address: str | None = None
    fulfillment_method: FulfillmentMethod | None = None
    scheduled_for: datetime | None = None
    handoff_note: str | None = None
    received_at: datetime | None = None
    delivered_at: datetime | None = None
    created_at: datetime
