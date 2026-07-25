from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import OtpPurpose, User, UserStatus
from app.schemas.auth import (
    ChangePasswordRequest,
    EmailRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyOtpRequest,
)
from app.schemas.common import MessageResponse
from app.schemas.users import UserMe
from app.services.otp import consume_otp, get_valid_otp, issue_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-registration-otp", response_model=MessageResponse, status_code=202)
async def request_registration_otp(
    payload: EmailRequest,
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    email = payload.email.lower().strip()
    exists = await session.scalar(select(User.id).where(User.email == email))
    if exists:
        raise HTTPException(status_code=409, detail="An account already exists with this email")
    await issue_otp(session, email=email, purpose=OtpPurpose.REGISTER)
    return MessageResponse(message="Verification code sent")


@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp_code(
    payload: VerifyOtpRequest,
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await get_valid_otp(
        session,
        email=payload.email,
        purpose=payload.purpose,
        code=payload.otp,
        consume=False,
    )
    return MessageResponse(message="Verification code is valid")


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    email = payload.email.lower().strip()
    exists = await session.scalar(select(User.id).where(User.email == email))
    if exists:
        raise HTTPException(status_code=409, detail="An account already exists with this email")

    await consume_otp(session, email=email, purpose=OtpPurpose.REGISTER, code=payload.otp)
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name.strip(),
        city=payload.city.strip() if payload.city else None,
        area=payload.area.strip() if payload.area else None,
        email_verified_at=datetime.now(UTC),
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=409, detail="An account already exists with this email") from exc

    await session.refresh(user)
    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        token_version=user.token_version,
    )
    return TokenResponse(access_token=token, user=UserMe.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    email = payload.email.lower().strip()
    user = await session.scalar(select(User).where(User.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Your account is suspended")
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Your account is unavailable")

    user.last_login_at = datetime.now(UTC)
    await session.commit()
    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        token_version=user.token_version,
    )
    return TokenResponse(access_token=token, user=UserMe.model_validate(user))


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    # The access token is stateless; the Next.js layer removes the HTTP-only cookie.
    return MessageResponse(message="Signed out")


@router.post("/request-password-reset", response_model=MessageResponse, status_code=202)
async def request_password_reset(
    payload: EmailRequest,
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    email = payload.email.lower().strip()
    user = await session.scalar(select(User).where(User.email == email))
    if user and user.status == UserStatus.ACTIVE:
        await issue_otp(session, email=email, purpose=OtpPurpose.RESET_PASSWORD)
    return MessageResponse(message="If the account exists, a verification code has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    email = payload.email.lower().strip()
    user = await session.scalar(select(User).where(User.email == email).with_for_update())
    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Unable to reset password")
    await consume_otp(
        session,
        email=email,
        purpose=OtpPurpose.RESET_PASSWORD,
        code=payload.otp,
    )
    user.password_hash = hash_password(payload.new_password)
    user.token_version += 1
    await session.commit()
    return MessageResponse(message="Password reset successfully")


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    user.token_version += 1
    await session.commit()
    return MessageResponse(message="Password changed. Please sign in again.")


@router.get("/me", response_model=UserMe)
async def me(user: User = Depends(get_current_user)) -> UserMe:
    return UserMe.model_validate(user)
