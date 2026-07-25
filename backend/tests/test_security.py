from uuid import uuid4

from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_otp,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    hashed = hash_password("StrongPass123")
    assert verify_password("StrongPass123", hashed)
    assert not verify_password("WrongPass123", hashed)


def test_otp_hash_and_format() -> None:
    code = generate_otp()
    assert len(code) == 6 and code.isdigit()
    hashed = hash_otp(code)
    assert verify_otp(code, hashed)
    assert not verify_otp("000000" if code != "000000" else "111111", hashed)


def test_token_contains_identity_and_version() -> None:
    user_id = uuid4()
    token = create_access_token(user_id=user_id, role="USER", token_version=3)
    payload = decode_access_token(token)
    assert payload["sub"] == str(user_id)
    assert payload["role"] == "USER"
    assert payload["tv"] == 3
