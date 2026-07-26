from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.models import UserRole, UserStatus
from app.schemas.common import ORMModel

USERNAME_PATTERN = re.compile(r"^[a-z0-9_]{3,30}$")


def normalize_username(value: str) -> str:
    normalized = value.strip().lower()
    if not USERNAME_PATTERN.fullmatch(normalized):
        raise ValueError(
            "Username must be 3–30 characters and contain only lowercase letters, numbers and underscores"
        )
    return normalized


class UserPublic(ORMModel):
    id: UUID
    username: str
    display_name: str
    avatar_url: str | None = None
    bio: str | None = None
    city: str | None = None
    area: str | None = None
    positive_points: int = 0
    negative_points: int = 0
    created_at: datetime


class UserMe(UserPublic):
    email: EmailStr
    phone: str | None = None
    role: UserRole
    status: UserStatus
    email_verified_at: datetime | None = None
    last_login_at: datetime | None = None


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=30)
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    bio: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str | None) -> str | None:
        return normalize_username(value) if value is not None else None


class UserAdminUpdate(BaseModel):
    role: UserRole | None = None
    status: UserStatus | None = None


class UserAdminView(UserMe):
    updated_at: datetime
