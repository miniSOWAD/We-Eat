from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.models import OtpPurpose
from app.schemas.users import UserMe


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
    otp: str = Field(pattern=r"^\d{6}$")
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)

    _strong_password = field_validator("password")(validate_strong_password)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


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
