from __future__ import annotations

import argparse
import asyncio
import sys

from app.core.config import settings
from app.services.email import send_test_email


def print_status() -> None:
    print("We Eat integration status")
    print(f"  Email mode:          {settings.effective_email_mode}")
    print(f"  Email configured:    {settings.email_is_configured}")
    print(f"  SMTP host:           {settings.effective_smtp_host or 'not set'}")
    print(f"  SMTP sender:         {settings.smtp_from_email}")
    if settings.email_configuration_errors:
        print("  Email notes:          " + "; ".join(settings.email_configuration_errors))
    print(f"  Cloudinary ready:    {settings.cloudinary_is_configured}")
    print(f"  Cloudinary source:   {settings.cloudinary_configuration_source}")
    print(f"  Cloudinary cloud:    {settings.effective_cloudinary_cloud_name or 'not set'}")


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email-to", help="Send a real test email to this address")
    args = parser.parse_args()

    print_status()
    if args.email_to:
        if not settings.email_is_configured:
            print("\nEmail test skipped because email delivery is not configured.")
            return 1
        await send_test_email(to_email=args.email_to.strip().lower())
        print(f"\nTest email accepted by the SMTP provider for {args.email_to}.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
