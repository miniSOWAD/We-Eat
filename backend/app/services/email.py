from __future__ import annotations

import html
import logging
from email.message import EmailMessage

import aiosmtplib
import httpx

from app.core.config import settings

logger = logging.getLogger("we_eat.email")


def _email_html(*, title: str, preheader: str, body: str, code: str | None = None) -> str:
    code_block = ""
    if code:
        code_block = f"""
        <div style=\"margin:28px 0;padding:18px 20px;border-radius:16px;background:#fff2c6;
                    color:#182235;font-size:32px;font-weight:800;letter-spacing:8px;text-align:center\">
          {html.escape(code)}
        </div>
        """
    return f"""<!doctype html>
<html><body style=\"margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#182235\">
  <div style=\"display:none;max-height:0;overflow:hidden\">{html.escape(preheader)}</div>
  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">
    <tr><td align=\"center\" style=\"padding:32px 16px\">
      <table role=\"presentation\" width=\"100%\" style=\"max-width:560px;background:#ffffff;
             border:1px solid #dce3f0;border-radius:22px;overflow:hidden\">
        <tr><td style=\"padding:24px 28px;background:linear-gradient(135deg,#fff8de,#aac4f5)\">
          <div style=\"font-size:23px;font-weight:800\">We Eat</div>
        </td></tr>
        <tr><td style=\"padding:30px 28px\">
          <h1 style=\"margin:0 0 14px;font-size:26px\">{html.escape(title)}</h1>
          <p style=\"margin:0;color:#536074;line-height:1.7\">{html.escape(body)}</p>
          {code_block}
          <p style=\"margin:22px 0 0;color:#768196;font-size:13px;line-height:1.6\">
            This message was sent automatically. Never share a verification code or password.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


async def _send_smtp(*, to_email: str, subject: str, text: str, html_body: str) -> None:
    message = EmailMessage()
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    if settings.email_reply_to:
        message["Reply-To"] = settings.email_reply_to
    message.set_content(text)
    message.add_alternative(html_body, subtype="html")

    await aiosmtplib.send(
        message,
        hostname=settings.effective_smtp_host,
        port=settings.smtp_port,
        username=settings.effective_smtp_username or None,
        password=settings.effective_smtp_password or None,
        start_tls=settings.smtp_start_tls and not settings.smtp_use_tls,
        use_tls=settings.smtp_use_tls,
        timeout=settings.smtp_timeout_seconds,
    )


async def _send_brevo(*, to_email: str, subject: str, text: str, html_body: str) -> None:
    payload: dict[str, object] = {
        "sender": {"name": settings.smtp_from_name, "email": settings.smtp_from_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": text,
        "htmlContent": html_body,
    }
    if settings.email_reply_to:
        payload["replyTo"] = {"email": settings.email_reply_to}

    async with httpx.AsyncClient(timeout=settings.smtp_timeout_seconds) as client:
        response = await client.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": settings.brevo_api_key, "accept": "application/json"},
            json=payload,
        )
        response.raise_for_status()


async def send_email(*, to_email: str, subject: str, text: str, html_body: str) -> None:
    mode = settings.effective_email_mode
    if mode == "log":
        print(f"[WE EAT EMAIL] To={to_email} Subject={subject}\n{text}")
        return
    if not settings.email_is_configured:
        missing = ", ".join(settings.email_configuration_errors) or "provider credentials"
        raise RuntimeError(f"Email mode '{mode}' is not fully configured. Missing: {missing}")

    try:
        if mode == "smtp":
            await _send_smtp(to_email=to_email, subject=subject, text=text, html_body=html_body)
            return
        if mode == "brevo":
            await _send_brevo(to_email=to_email, subject=subject, text=text, html_body=html_body)
            return
    except Exception:
        logger.exception(
            "Email delivery failed",
            extra={
                "mode": mode,
                "smtp_host": settings.effective_smtp_host,
                "to_domain": to_email.rsplit("@", 1)[-1] if "@" in to_email else "unknown",
            },
        )
        raise
    raise RuntimeError("Unsupported email mode")


async def send_otp_email(*, to_email: str, code: str, purpose: str) -> None:
    subject = "Verify your We Eat account" if purpose == "REGISTER" else "Reset your We Eat password"
    action = "complete your registration" if purpose == "REGISTER" else "reset your password"
    text = (
        f"Your We Eat verification code is {code}. Use it to {action}. "
        f"It expires in {settings.otp_expire_minutes} minutes. Do not share this code."
    )
    html_body = _email_html(
        title=subject,
        preheader=f"Your verification code is {code}",
        body=f"Use the code below to {action}. It expires in {settings.otp_expire_minutes} minutes.",
        code=code,
    )
    await send_email(to_email=to_email, subject=subject, text=text, html_body=html_body)


async def send_test_email(*, to_email: str) -> None:
    subject = "We Eat email delivery test"
    text = "Email delivery is configured correctly for your We Eat backend."
    html_body = _email_html(title=subject, preheader=text, body=text)
    await send_email(to_email=to_email, subject=subject, text=text, html_body=html_body)
