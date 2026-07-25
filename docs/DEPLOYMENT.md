# We Eat deployment guide

## 1. Rotate reference-project credentials

The previously supplied reference ZIP contained environment files. Do not reuse or republish those secrets. Rotate any active database, Cloudinary, JWT, email or internal API credentials before deploying We Eat.

## 2. Create Neon PostgreSQL

1. Create a new Neon project and database.
2. Copy the pooled connection string.
3. Change the scheme to `postgresql+asyncpg://` for FastAPI.
4. Keep `sslmode=require` in the query string.
5. Put the value in backend `DATABASE_URL`.
6. Run `database/neon_schema.sql` in the Neon SQL Editor, or run Alembic. Do not initialize the same clean database twice.

Example shape:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/DB?sslmode=require
```

## 3. Configure Cloudinary

Create a Cloudinary environment and set:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=we-eat
```

Uploads require an authenticated user, JPEG/PNG/WebP content, a valid image payload and a maximum size of 5 MB by default.

## 4. Configure email OTP

For local development use `EMAIL_MODE=log`. Production startup deliberately rejects that mode. Configure SMTP and use:

```env
EMAIL_MODE=smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=We Eat
SMTP_START_TLS=true
```

## 5. Deploy FastAPI

Build `backend/Dockerfile` on a container host. The container runs migrations and starts Uvicorn. Set every variable from `.env.example` in the host's secret manager.

Critical production settings:

```env
APP_ENV=production
APP_DEBUG=false
CORS_ORIGINS=https://your-frontend-domain.example
JWT_SECRET=<32+ random characters>
OTP_PEPPER=<different random secret>
```

Health check: `GET /health`.

Create the first admin after migrations:

```bash
python -m scripts.create_admin
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` first, then remove the bootstrap password from the host environment after use.

## 6. Deploy Next.js

Deploy `frontend` to Vercel or another Node 22 host. Set:

```env
BACKEND_API_URL=https://your-fastapi-domain.example
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.example
SESSION_COOKIE_NAME=we_eat_session
```

`BACKEND_API_URL` is server-only. Browser requests go through the Next.js proxy, which reads the HTTP-only cookie and attaches the Bearer token to FastAPI.

## 7. Production checks

- Test registration email delivery.
- Confirm JWT cookies are `Secure`, `HttpOnly` and `SameSite=Lax`.
- Confirm the backend CORS list contains only the deployed frontend origin.
- Upload a valid and invalid image.
- Verify an anonymous visitor cannot access private pickup details.
- Verify a suspended user's existing token stops working.
- Complete an order and verify reviews are unavailable before completion and available afterward.
- Test moderator report handling and audit logs.
- Enable platform-level rate limiting and log retention on the hosting provider.
- Add automated database backups and Cloudinary usage alerts.
