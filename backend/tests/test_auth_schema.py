import pytest
from pydantic import ValidationError

from app.schemas.auth import ChangePasswordRequest, RegisterRequest, ResetPasswordRequest


def registration_payload(password: str) -> dict:
    return {
        "email": "person@example.com",
        "otp": "123456",
        "password": password,
        "display_name": "Test Person",
    }


def test_register_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(**registration_payload("weakpass"))


def test_reset_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        ResetPasswordRequest(
            email="person@example.com",
            otp="123456",
            new_password="weakpass",
        )


def test_change_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        ChangePasswordRequest(current_password="OldPass123", new_password="weakpass")
