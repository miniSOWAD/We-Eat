# We Eat Backend v1.1.0

FastAPI backend for the We Eat food-sharing marketplace.

## Why the frontend showed `ECONNREFUSED`

That error means the Next.js server could not connect to FastAPI at the URL in
`BACKEND_API_URL`. Editing the backend `.env` file configures FastAPI, but it does
not install dependencies, create database tables, or start the API server.

## Windows local setup

Open PowerShell inside the backend folder:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set at minimum:

- `DATABASE_URL` — paste the Neon connection string.
- `JWT_SECRET` — at least 32 random characters.
- `OTP_PEPPER` — a different random secret.

For local registration testing, keep:

```env
EMAIL_MODE=log
```

The six-digit OTP will be printed in the backend terminal.

Then run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup_windows.ps1
.\start_dev.ps1
```

In a second PowerShell window:

```powershell
.\check_backend.ps1
```

Expected URLs:

- API: `http://127.0.0.1:8000`
- Health: `http://127.0.0.1:8000/health`
- Readiness: `http://127.0.0.1:8000/ready`
- Swagger: `http://127.0.0.1:8000/docs`

The frontend `.env.local` must contain:

```env
BACKEND_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=we_eat_session
```

Restart Next.js after changing `.env.local`.

## Manual setup without PowerShell scripts

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m scripts.check_config
alembic upgrade head
python -m scripts.check_database
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Neon connection handling

You may paste Neon’s standard `postgresql://` connection string. The backend:

- converts it to SQLAlchemy’s `postgresql+asyncpg://` driver;
- removes URL parameters that are not accepted as asyncpg keyword arguments;
- configures SSL through `DATABASE_SSL_MODE=require`.

## Main API groups

- Authentication and OTP
- User profiles and roles
- Listings and protected Cloudinary uploads
- Favorites
- Nested comments
- Orders
- Exchanges
- Completed-transaction reviews
- Reports and moderation
- Admin statistics, users, listings and audit logs
- Health and readiness checks

## Database initialization

Preferred method:

```powershell
alembic upgrade head
```

The SQL file in `database/neon_schema.sql` is provided for manual initialization
of a clean Neon database. Do not run both methods against the same empty database.

## Testing

```powershell
pip install -e ".[dev]"
pytest
```
