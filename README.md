# We Eat v1.0.0

We Eat is a mobile-first food-sharing marketplace for **free**, **discounted** and **exchange** listings.

## Architecture

```text
Browser
  → Next.js 16 frontend
  → Next.js server-side API proxy
  → FastAPI backend
  → Neon PostgreSQL
  → Cloudinary image storage
```

## Delivered scope

- Email OTP registration and password reset
- Argon2 password hashing
- HTTP-only JWT session managed by Next.js
- Database-backed role and status validation
- Public food discovery and filters
- Free, discounted and exchange listings
- Protected Cloudinary image upload
- Private pickup-detail separation
- Database favorites
- Nested comments and replies
- Order acceptance, readiness, cancellation and two-party completion
- Exchange acceptance, cancellation and two-party completion
- Reviews restricted to completed transactions
- User reporting, moderator workflow and audit logs
- Admin statistics, user roles and account-status control
- Neon SQL schema and Alembic migration
- Dockerfiles, local Compose configuration and deployment documentation
- UI based on `#FFF2C6`, `#FFF8DE`, `#AAC4F5` and `#8CA9FF`

## Start locally

1. Copy `backend/.env.example` to `backend/.env` and set secrets.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Configure Cloudinary and choose `EMAIL_MODE=log` for local development.
4. Run:

```bash
docker compose up --build
```

Or run both applications separately using their own README files.

## Database initialization

Use either:

- `database/neon_schema.sql` in a clean Neon database, or
- `alembic upgrade head` from the backend.

Do not initialize the same database using both methods.

## Launch boundary

This is a deployable, production-oriented v1 codebase, not a claim that a public production launch is complete. A real launch still requires your Neon, Cloudinary, SMTP, hosting and domain credentials; infrastructure rate limiting; backups; monitoring; legal pages; and an independent security review. Online card payments, live courier integration, chat and push notifications were not part of the supplied We Eat specification and are not fabricated here.

Read `docs/DEPLOYMENT.md`, `docs/API_ENDPOINTS.md`, `docs/SECURITY.md` and `docs/DESIGN_SYSTEM.md` before deployment.
