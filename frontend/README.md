# We Eat Frontend v1.2.1

Next.js 16 frontend for the We Eat marketplace.

## v1.2.1 changes

- Administration user and moderator tables no longer force a horizontal scrollbar on desktop.
- The unnecessary password column was removed; passwords are never available to the frontend.
- Management rows become responsive cards on small screens.
- Action buttons use compact layouts that fit the available dashboard width.
- Primary, cream and danger buttons now have dedicated dark-theme styles.
- Dashboard sidebar highlights and header controls have improved dark-mode contrast.
- Admin overview shows safe Email OTP and Cloudinary readiness information from the backend.

## Run

```powershell
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run check
npm run dev
```

Set `.env.local`:

```env
BACKEND_API_URL=https://your-fastapi-cloud-domain
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=we_eat_session
```

Do not append `/api/v1` to `BACKEND_API_URL`.
