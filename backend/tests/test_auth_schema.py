import pytest
from pydantic import ValidationError

from app.schemas.auth import ChangePasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest


def registration_payload(password: str, username: str = "test_person") -> dict:
    return {
        "email": "person@example.com",
        "username": username,
        "otp": "123456",
        "password": password,
        "display_name": "Test Person",
    }


def test_register_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(**registration_payload("weakpass"))


def test_register_normalizes_username() -> None:
    payload = RegisterRequest(**registration_payload("StrongPass123", "Test_User"))
    assert payload.username == "test_user"


def test_register_rejects_invalid_username() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(**registration_payload("StrongPass123", "bad user"))


def test_login_accepts_identifier() -> None:
    payload = LoginRequest(identifier="Test_User", password="StrongPass123")
    assert payload.identifier == "test_user"


def test_login_accepts_legacy_email_field() -> None:
    payload = LoginRequest(email="Person@Example.com", password="StrongPass123")
    assert payload.identifier == "person@example.com"


def test_reset_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        ResetPasswordRequest(email="person@example.com", otp="123456", new_password="weakpass")


def test_change_requires_strong_password() -> None:
    with pytest.raises(ValidationError):
        ChangePasswordRequest(current_password="OldPass123", new_password="weakpass")
