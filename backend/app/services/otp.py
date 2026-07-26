from __future__ import annotations

from datetime import UTC, datetime, timedelta
import logging

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_otp, hash_otp, verify_otp
from app.models.models import OtpCode, OtpPurpose
from app.services.email import send_otp_email

logger = logging.getLogger("we_eat.email")


async def issue_otp(session: AsyncSession, *, email: str, purpose: OtpPurpose) -> None:
    normalized = email.lower().strip()
    now = datetime.now(UTC)
    window_start = now - timedelta(minutes=15)
    request_count = await session.scalar(
        select(func.count(OtpCode.id)).where(
            OtpCode.email == normalized,
            OtpCode.purpose == purpose,
            OtpCode.created_at >= window_start,
        )
    )
    if int(request_count or 0) >= settings.otp_request_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Try again later.",
        )

    # Invalidate previous unused codes so only the newest code can be accepted.
    await session.execute(
        update(OtpCode)
        .where(
            OtpCode.email == normalized,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .values(consumed_at=now)
    )

    code = generate_otp()
    record = OtpCode(
        email=normalized,
        purpose=purpose,
        code_hash=hash_otp(code),
        expires_at=now + timedelta(minutes=settings.otp_expire_minutes),
    )
    session.add(record)
    await session.flush()

    try:
        await send_otp_email(to_email=normalized, code=code, purpose=purpose.value)
        await session.commit()
    except HTTPException:
        await session.rollback()
        raise
    except Exception as exc:
        await session.rollback()
        logger.exception("Unable to deliver verification email", extra={"email": normalized})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification email could not be delivered. Check the email provider configuration.",
        ) from exc


async def get_valid_otp(
    session: AsyncSession,
    *,
    email: str,
    purpose: OtpPurpose,
    code: str,
    consume: bool,
) -> OtpCode:
    normalized = email.lower().strip()
    record = await session.scalar(
        select(OtpCode)
        .where(
            OtpCode.email == normalized,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .order_by(OtpCode.created_at.desc())
        .with_for_update()
    )
    if not record:
        raise HTTPException(status_code=400, detail="No active verification code")

    now = datetime.now(UTC)
    if record.expires_at <= now:
        raise HTTPException(status_code=400, detail="Verification code has expired")
    if record.attempts >= settings.otp_max_attempts:
        raise HTTPException(status_code=429, detail="Too many verification attempts")
    if not verify_otp(code, record.code_hash):
        record.attempts += 1
        await session.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if consume:
        record.consumed_at = now
        await session.flush()
    return record


async def consume_otp(
    session: AsyncSession, *, email: str, purpose: OtpPurpose, code: str
) -> OtpCode:
    return await get_valid_otp(
        session,
        email=email,
        purpose=purpose,
        code=code,
        consume=True,
    )
