# We Eat Backend v1.3.0

FastAPI backend for the We Eat food-sharing marketplace.

## v1.3.0 changes

- Unified private proposal feed for listing owners.
- Public proposal counts without exposing requester identities or offers.
- Provider-selected pickup or delivery method and scheduled handover time.
- Accepted listings enter the existing `RESERVED` state, displayed as **Bid in progress**.
- Recipients confirm **Received** first; providers cannot confirm **Delivered** before that.
- Rejected proposals are removed from the owner's active proposal list.
- Accepted recipients can query their active handovers for the floating frontend dock.
- New Alembic revision: `20260726_0003_proposal_handoffs.py`.

## Mandatory database update

Before using v1.3.0, run:

```powershell
alembic upgrade head
```

FastAPI Cloud users may instead paste `database/20260726_v1_3_proposal_handoffs.sql` into the Neon SQL Editor before redeploying.

## Important correction about the earlier reference project

The reference project sent email through SMTP using `smtp-relay.brevo.com`. It did not use the Brevo HTTP API, but it still used Brevo as its SMTP relay. This release supports that legacy setup and also supports direct Gmail/Outlook SMTP.

## FastAPI Cloud environment

FastAPI Cloud does not use your local `.env` automatically. Add secrets in the FastAPI Cloud dashboard or CLI, then redeploy.

### Gmail SMTP example

```env
EMAIL_MODE=smtp
SMTP_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-address@gmail.com
SMTP_PASSWORD=your-16-character-google-app-password
SMTP_FROM_EMAIL=your-address@gmail.com
SMTP_FROM_NAME=We Eat
SMTP_START_TLS=true
SMTP_USE_TLS=false
```

Use a Google App Password, not your normal Google password.

### Generic SMTP example

```env
EMAIL_MODE=smtp
SMTP_HOST=mail.your-provider.example
SMTP_PORT=587
SMTP_USERNAME=your-login
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=verified-sender@example.com
SMTP_FROM_NAME=We Eat
SMTP_START_TLS=true
SMTP_USE_TLS=false
```

### Cloudinary

Preferred single-secret configuration:

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_FOLDER=we-eat
```

Or use:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local checks

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m scripts.check_config
.\.venv\Scripts\python.exe -m scripts.check_integrations
.\.venv\Scripts\python.exe -m scripts.check_integrations --email-to your-address@example.com
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Integration diagnostics

As an administrator:

```text
GET  /api/v1/admin/email/status
POST /api/v1/admin/email/test
GET  /api/v1/admin/integrations/status
```

The status responses contain configuration state only, never passwords or API secrets.
