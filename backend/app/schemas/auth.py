from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.models import OtpPurpose
from app.schemas.users import UserMe, normalize_username


def validate_strong_password(value: str) -> str:
    checks = (
        any(character.islower() for character in value),
        any(character.isupper() for character in value),
        any(character.isdigit() for character in value),
    )
    if not all(checks):
        raise ValueError("Password must contain uppercase, lowercase and a number")
    return value


class EmailRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")
    purpose: OtpPurpose = OtpPurpose.REGISTER


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=30)
    otp: str = Field(pattern=r"^\d{6}$")
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)

    _strong_password = field_validator("password")(validate_strong_password)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return normalize_username(value)


class LoginRequest(BaseModel):
    # `email` remains accepted for backward compatibility with older clients.
    identifier: str | None = Field(default=None, min_length=3, max_length=320)
    email: EmailStr | None = None
    password: str = Field(min_length=1, max_length=128)

    @model_validator(mode="after")
    def resolve_identifier(self) -> "LoginRequest":
        value = self.identifier or (str(self.email) if self.email else None)
        if not value:
            raise ValueError("Username or email is required")
        self.identifier = value.strip().lower()
        return self


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)

    _strong_password = field_validator("new_password")(validate_strong_password)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    _strong_password = field_validator("new_password")(validate_strong_password)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserMe
