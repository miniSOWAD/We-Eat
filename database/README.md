# Neon database setup

Use **one** schema method on a clean database:

1. Paste `neon_schema.sql` into the Neon SQL Editor and run it, **or**
2. Configure `backend/.env` and run `uv run alembic upgrade head`.

Do not run both against the same clean database.

The schema contains:

- users and OTP codes
- listings, images and separately protected pickup details
- favorites and nested comments
- orders and exchange requests
- transaction-locked reviews
- reports and moderator audit logs

The application generates UUID values, so no PostgreSQL UUID extension is required.
