from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.users import UserMe


class EmailRequest(BaseModel):
    email: EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    city: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, max_length=100)

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        checks = [any(c.islower() for c in value), any(c.isupper() for c in value), any(c.isdigit() for c in value)]
        if not all(checks):
            raise ValueError("Password must contain uppercase, lowercase and a number")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserMe
