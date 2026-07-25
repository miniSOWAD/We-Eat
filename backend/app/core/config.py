from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.database_url import normalize_database_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
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

    email_mode: str = "log"
    smtp_host: str = ""
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "no-reply@example.com"
    smtp_from_name: str = "We Eat"
    smtp_start_tls: bool = True
    smtp_timeout_seconds: float = Field(default=20.0, gt=0, le=120)

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_folder: str = "we-eat"
    max_upload_bytes: int = Field(default=5 * 1024 * 1024, ge=1024)
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    admin_email: str = "admin@example.com"
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
        if normalized not in {"log", "smtp"}:
            raise ValueError("EMAIL_MODE must be log or smtp")
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
