# We Eat Backend v1.1.0 Upgrade Notes

## Diagnosis of the reported registration failure

The logged failure was:

```text
TypeError: fetch failed
code: ECONNREFUSED
POST /api/backend/auth/request-registration-otp 500
```

This is a transport failure before FastAPI receives the request. It is not a
missing registration route. The route exists at:

```text
POST /api/v1/auth/request-registration-otp
```

The backend must be running on the URL configured by the frontend.

## Changes in v1.1.0

- Accepts standard Neon `postgresql://` URLs.
- Normalizes the URL for SQLAlchemy asyncpg.
- Handles Neon SSL separately through `DATABASE_SSL_MODE`.
- Removes unsupported `channel_binding` and `sslmode` URL keywords before
  SQLAlchemy passes connection arguments to asyncpg.
- Adds `/`, `/health`, `/ready`, `/api/v1/system/health`, and
  `/api/v1/system/ready`.
- Performs an optional database connection check during startup.
- Readiness detects a missing `users` table and tells the operator to run
  `alembic upgrade head`.
- Adds Windows setup, startup, health-check and configuration scripts.
- Makes OTP issuance transactional: failed email delivery no longer leaves a
  committed unusable OTP.
- Invalidates older unconsumed OTPs when a new code is issued.
- Adds OTP verification and API logout endpoints.
- Applies the strong-password rule to registration, reset and change-password.
- Adds database error responses with HTTP 503 and request IDs.
- Adds an automated frontend-to-backend route contract test.
- Adds `requirements.txt` for conventional pip-based installation.

## API logic preserved

The existing listing, favorite, comment, order, exchange, review, report,
moderator and admin workflows remain unchanged. This release focuses on startup,
connectivity, authentication reliability and API observability.
