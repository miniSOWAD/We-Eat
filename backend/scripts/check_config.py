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
    print(f"  environment:       {settings.app_env}")
    print(f"  database:          {masked_database_url()}")
    print(f"  CORS:              {', '.join(settings.cors_origin_list)}")
    print(f"  email requested:   {settings.email_mode}")
    print(f"  email effective:   {settings.effective_email_mode}")
    print(f"  email configured:  {settings.email_is_configured}")
    print(f"  SMTP host:         {settings.effective_smtp_host or 'not set'}")
    print(f"  email sender:      {settings.smtp_from_email}")
    print(f"  cloudinary:        {settings.cloudinary_is_configured}")
    print(f"  cloudinary source: {settings.cloudinary_configuration_source}")

    problems: list[str] = []
    if settings.jwt_secret.startswith("replace-"):
        problems.append("JWT_SECRET still uses the example value")
    if settings.otp_pepper.startswith("replace-"):
        problems.append("OTP_PEPPER still uses the example value")
    if settings.effective_email_mode != "log" and not settings.email_is_configured:
        problems.extend(settings.email_configuration_errors)
    if not settings.cloudinary_is_configured:
        problems.append(
            "Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET"
        )

    if problems:
        print("\nConfiguration problems:")
        for problem in dict.fromkeys(problems):
            print(f"  - {problem}")
        return 1

    print("\nConfiguration looks usable.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
