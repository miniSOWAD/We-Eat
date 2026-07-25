# We Eat Backend

FastAPI backend for the We Eat food-sharing marketplace.

## Local start

```bash
cp .env.example .env
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

OpenAPI documentation is available at `/docs` outside production mode.

## Core guarantees

- JWTs are validated against the current database user, status, role and token version.
- Private pickup addresses are stored separately and are never included in public listing responses.
- Image uploads require authentication, MIME validation and size limits.
- Reviews require a completed order or exchange.
- Favorites are persisted in PostgreSQL.
- Moderator and admin actions write audit logs.
