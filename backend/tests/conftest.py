import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://test:test@127.0.0.1/test?sslmode=disable",
)
os.environ.setdefault("CHECK_DATABASE_ON_STARTUP", "false")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-longer-than-thirty-two-characters")
os.environ.setdefault("OTP_PEPPER", "test-otp-pepper-long-enough")
os.environ.setdefault("EMAIL_MODE", "log")
