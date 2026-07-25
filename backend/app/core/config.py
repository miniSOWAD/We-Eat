from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    app_name: str = "We Eat API"
    app_env: str = "development"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str
    database_echo: bool = False
    db_pool_size: int = 5
    db_max_overflow: int = 10

    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 10080
    otp_pepper: str = Field(min_length=16)
    otp_expire_minutes: int = 10
    otp_max_attempts: int = 5
    otp_request_limit: int = 3

    cors_origins: str = "http://localhost:3000"

    email_mode: str = "log"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "no-reply@example.com"
    smtp_from_name: str = "We Eat"
    smtp_start_tls: bool = True

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_folder: str = "we-eat"
    max_upload_bytes: int = 5 * 1024 * 1024
    allowed_image_types: str = "image/jpeg,image/png,image/webp"

    admin_email: str = "admin@example.com"
    admin_password: str = "ChangeMe123!"
    admin_name: str = "We Eat Admin"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def allowed_image_type_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_image_types.split(",") if item.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
