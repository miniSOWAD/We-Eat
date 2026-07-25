from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel
from app.schemas.listings import ListingCard
from app.schemas.users import UserPublic


class FavoriteView(BaseModel):
    id: UUID
    listing: ListingCard
    created_at: datetime


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1200)
    parent_comment_id: UUID | None = None


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=1200)


class CommentView(ORMModel):
    id: UUID
    listing_id: UUID
    parent_comment_id: UUID | None = None
    content: str
    is_deleted: bool
    user: UserPublic
    created_at: datetime
    updated_at: datetime
    replies: list["CommentView"] = Field(default_factory=list)


class ReviewCreate(BaseModel):
    order_id: UUID | None = None
    exchange_request_id: UUID | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewView(ORMModel):
    id: UUID
    reviewer: UserPublic
    reviewee: UserPublic
    order_id: UUID | None = None
    exchange_request_id: UUID | None = None
    rating: int
    comment: str | None = None
    created_at: datetime
