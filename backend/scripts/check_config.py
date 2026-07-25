from __future__ import annotations

import sys

from app.core.config import settings


def masked_database_url() -> str:
    value = settings.database_url
    if "@" not in value:
        return value
    prefix, suffix = value.rsplit("@", 1)
    if ":" in prefix:
        prefix = prefix.split(":", 2)[0] + ":***"
    return f"{prefix}@{suffix}"


def main() -> int:
    print("We Eat backend configuration")
    print(f"  environment: {settings.app_env}")
    print(f"  database:    {masked_database_url()}")
    print(f"  CORS:        {', '.join(settings.cors_origin_list)}")
    print(f"  email mode:  {settings.email_mode}")
    print(
        "  cloudinary:  "
        + ("configured" if settings.cloudinary_cloud_name else "not configured")
    )

    problems: list[str] = []
    if settings.jwt_secret.startswith("replace-"):
        problems.append("JWT_SECRET still uses the example value")
    if settings.otp_pepper.startswith("replace-"):
        problems.append("OTP_PEPPER still uses the example value")
    if settings.email_mode == "smtp" and not settings.smtp_host:
        problems.append("EMAIL_MODE is smtp but SMTP_HOST is empty")

    if problems:
        print("\nConfiguration problems:")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("\nConfiguration looks usable.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
