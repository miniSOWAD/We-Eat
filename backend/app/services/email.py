from __future__ import annotations

from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings


async def send_otp_email(*, to_email: str, code: str, purpose: str) -> None:
    subject = "Verify your We Eat account" if purpose == "REGISTER" else "Reset your We Eat password"
    action = "complete your registration" if purpose == "REGISTER" else "reset your password"
    text = (
        f"Your We Eat verification code is {code}. "
        f"Use it to {action}. It expires in {settings.otp_expire_minutes} minutes. "
        "Do not share this code."
    )

    if settings.email_mode.lower() == "log":
        print(f"[WE EAT OTP] {to_email} {purpose}: {code}")
        return

    if not settings.smtp_host or not settings.smtp_from_email:
        raise RuntimeError("SMTP is not configured")

    message = EmailMessage()
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text)

    await aiosmtplib.send(
        message,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_username or None,
        password=settings.smtp_password or None,
        start_tls=settings.smtp_start_tls,
        timeout=settings.smtp_timeout_seconds,
    )
