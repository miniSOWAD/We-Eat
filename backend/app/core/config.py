from __future__ import annotations

from functools import lru_cache
from urllib.parse import unquote, urlparse

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.database_url import normalize_database_url


SMTP_HOSTS_BY_DOMAIN = {
    "gmail.com": "smtp.gmail.com",
    "googlemail.com": "smtp.gmail.com",
    "outlook.com": "smtp.office365.com",
    "hotmail.com": "smtp.office365.com",
    "live.com": "smtp.office365.com",
    "yahoo.com": "smtp.mail.yahoo.com",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    app_name: str = "We Eat API"
    app_env: str = "development"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str
    database_echo: bool = False
    database_ssl_mode: str = "require"
    db_pool_size: int = Field(default=5, ge=1, le=50)
    db_max_overflow: int = Field(default=10, ge=0, le=100)
    db_pool_recycle_seconds: int = Field(default=300, ge=30)
    db_connect_timeout_seconds: float = Field(default=15.0, gt=0, le=120)
    db_command_timeout_seconds: float = Field(default=30.0, gt=0, le=300)
    check_database_on_startup: bool = True

    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = Field(default=10080, ge=5)
    otp_pepper: str = Field(min_length=16)
    otp_expire_minutes: int = Field(default=10, ge=1, le=60)
    otp_max_attempts: int = Field(default=5, ge=1, le=20)
    otp_request_limit: int = Field(default=3, ge=1, le=20)

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # `smtp` is the normal mode. Brevo HTTP remains supported but is optional.
    # `auto` uses SMTP when fully configured, otherwise Brevo, otherwise log mode in development.
    email_mode: str = "auto"
    brevo_api_key: str = ""
    email_reply_to: str = ""
    smtp_host: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_HOST", "MAIL_SERVER"),
    )
    smtp_port: int = Field(
        default=587,
        ge=1,
        le=65535,
        validation_alias=AliasChoices("SMTP_PORT", "MAIL_PORT"),
    )
    smtp_username: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_USERNAME", "MAIL_USERNAME"),
    )
    smtp_password: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_PASSWORD", "MAIL_PASSWORD"),
    )
    # Compatibility with the previous project, which stored the SMTP relay password as SMTP_KEY.
    smtp_key: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_KEY", "BREVO_SMTP_KEY"),
    )
    smtp_provider: str = ""
    smtp_from_email: str = Field(
        default="no-reply@example.com",
        validation_alias=AliasChoices("SMTP_FROM_EMAIL", "MAIL_FROM"),
    )
    smtp_from_name: str = Field(
        default="We Eat",
        validation_alias=AliasChoices("SMTP_FROM_NAME", "MAIL_FROM_NAME"),
    )
    smtp_start_tls: bool = Field(
        default=True,
        validation_alias=AliasChoices("SMTP_START_TLS", "MAIL_STARTTLS"),
    )
    smtp_use_tls: bool = Field(
        default=False,
        validation_alias=AliasChoices("SMTP_USE_TLS", "MAIL_SSL_TLS"),
    )
    smtp_require_auth: bool = True
    smtp_timeout_seconds: float = Field(default=20.0, gt=0, le=120)

    # Either CLOUDINARY_URL or the three individual values can be used.
    cloudinary_url: str = ""
    cloudinary_cloud_name: str = Field(
        default="",
        validation_alias=AliasChoices(
            "CLOUDINARY_CLOUD_NAME",
            "CLOUD_NAME",
            "CLOUDINARY_NAME",
        ),
    )
    cloudinary_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("CLOUDINARY_API_KEY", "CLOUDINARY_KEY"),
    )
    cloudinary_api_secret: str = Field(
        default="",
        validation_alias=AliasChoices("CLOUDINARY_API_SECRET", "CLOUDINARY_SECRET"),
    )
    cloudinary_folder: str = "we-eat"
    max_upload_bytes: int = Field(default=5 * 1024 * 1024, ge=1024)
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    admin_email: str = "admin@example.com"
    admin_username: str = "admin"
    admin_password: str = "ChangeMe123!"
    admin_name: str = "We Eat Admin"

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        return normalize_database_url(value)

    @field_validator("database_ssl_mode")
    @classmethod
    def validate_database_ssl_mode(cls, value: str) -> str:
        normalized = value.lower().strip()
        allowed = {"disable", "allow", "prefer", "require", "verify-ca", "verify-full"}
        if normalized not in allowed:
            raise ValueError(f"DATABASE_SSL_MODE must be one of: {', '.join(sorted(allowed))}")
        return normalized

    @field_validator("email_mode")
    @classmethod
    def validate_email_mode(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in {"auto", "log", "smtp", "brevo"}:
            raise ValueError("EMAIL_MODE must be auto, log, smtp or brevo")
        return normalized

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip().rstrip("/") for item in self.cors_origins.split(",") if item.strip()]

    @property
    def allowed_image_type_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_image_types.split(",") if item.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def effective_smtp_host(self) -> str:
        if self.smtp_host.strip():
            return self.smtp_host.strip()
        provider = self.smtp_provider.strip().lower()
        if provider in {"brevo", "sendinblue"} or self.smtp_key:
            return "smtp-relay.brevo.com"
        if provider in {"gmail", "google"}:
            return "smtp.gmail.com"
        if provider in {"outlook", "office365", "microsoft"}:
            return "smtp.office365.com"
        candidate = self.smtp_from_email.strip().lower()
        if "@" not in candidate:
            candidate = self.smtp_username.strip().lower()
        domain = candidate.rsplit("@", 1)[-1] if "@" in candidate else ""
        return SMTP_HOSTS_BY_DOMAIN.get(domain, "")

    @property
    def effective_smtp_username(self) -> str:
        username = self.smtp_username.strip()
        host = self.effective_smtp_host.lower()
        # Gmail and Microsoft SMTP authentication normally use the full email address.
        if (host in {"smtp.gmail.com", "smtp.office365.com"}) and "@" not in username:
            return self.smtp_from_email.strip()
        return username

    @property
    def effective_smtp_password(self) -> str:
        password = (self.smtp_password or self.smtp_key).strip()
        if self.effective_smtp_host.lower() == "smtp.gmail.com":
            return password.replace(" ", "")
        return password

    @property
    def smtp_is_configured(self) -> bool:
        base = bool(self.effective_smtp_host and self.smtp_from_email.strip())
        if not base:
            return False
        if not self.smtp_require_auth:
            return True
        return bool(self.effective_smtp_username and self.effective_smtp_password)

    @property
    def brevo_is_configured(self) -> bool:
        return bool(self.brevo_api_key and self.smtp_from_email.strip())

    @property
    def effective_email_mode(self) -> str:
        if self.email_mode != "auto":
            return self.email_mode
        if self.smtp_is_configured:
            return "smtp"
        if self.brevo_is_configured:
            return "brevo"
        return "log"

    @property
    def email_is_configured(self) -> bool:
        mode = self.effective_email_mode
        if mode == "smtp":
            return self.smtp_is_configured
        if mode == "brevo":
            return self.brevo_is_configured
        return False

    @property
    def email_configuration_errors(self) -> list[str]:
        mode = self.effective_email_mode
        if mode == "log":
            return ["EMAIL_MODE resolves to log; OTP codes are printed to backend logs"]
        if mode == "brevo":
            missing = []
            if not self.brevo_api_key:
                missing.append("BREVO_API_KEY")
            if not self.smtp_from_email.strip():
                missing.append("SMTP_FROM_EMAIL")
            return missing
        missing = []
        if not self.effective_smtp_host:
            missing.append("SMTP_HOST")
        if not self.smtp_from_email.strip():
            missing.append("SMTP_FROM_EMAIL")
        if self.smtp_require_auth and not self.effective_smtp_username:
            missing.append("SMTP_USERNAME")
        if self.smtp_require_auth and not self.effective_smtp_password:
            missing.append("SMTP_PASSWORD")
        return missing

    @property
    def cloudinary_credentials(self) -> tuple[str, str, str] | None:
        if self.cloudinary_url.strip():
            parsed = urlparse(self.cloudinary_url.strip())
            if parsed.scheme != "cloudinary":
                return None
            if parsed.hostname and parsed.username and parsed.password:
                return (
                    unquote(parsed.hostname),
                    unquote(parsed.username),
                    unquote(parsed.password),
                )
        values = (
            self.cloudinary_cloud_name.strip(),
            self.cloudinary_api_key.strip(),
            self.cloudinary_api_secret.strip(),
        )
        return values if all(values) else None

    @property
    def cloudinary_is_configured(self) -> bool:
        return self.cloudinary_credentials is not None

    @property
    def effective_cloudinary_cloud_name(self) -> str:
        credentials = self.cloudinary_credentials
        return credentials[0] if credentials else ""

    @property
    def cloudinary_configuration_source(self) -> str:
        if self.cloudinary_url.strip() and self.cloudinary_credentials:
            return "CLOUDINARY_URL"
        if self.cloudinary_credentials:
            return "individual variables"
        return "not configured"

    @property
    def database_connect_args(self) -> dict[str, object]:
        return {
            "ssl": self.database_ssl_mode,
            "timeout": self.db_connect_timeout_seconds,
            "command_timeout": self.db_command_timeout_seconds,
            "server_settings": {"application_name": "we-eat-api"},
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
