from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.models import UserRole, UserStatus
from app.schemas.common import ORMModel


class UserPublic(ORMModel):
    id: UUID
    display_name: str
    avatar_url: str | None = None
    bio: str | None = None
    city: str | None = None
    area: str | None = None
    created_at: datetime


class UserMe(UserPublic):
    email: EmailStr
    phone: str | None = None
    role: UserRole
    status: UserStatus
    email_verified_at: datetime | None = None
    last_login_at: datetime | None = None


class UserUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    avatar_url: str | None = Field(default=None, max_length=1000)
    bio: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)


class UserAdminUpdate(BaseModel):
    role: UserRole | None = None
    status: UserStatus | None = None


class UserAdminView(UserMe):
    updated_at: datetime
