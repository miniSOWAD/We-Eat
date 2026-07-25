# We Eat Frontend

Next.js 16 frontend for the We Eat food-sharing marketplace.

## Version

`1.1.0` — mobile-first UI upgrade.

## Run locally

```powershell
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
```

Open `http://localhost:3000`.

The application still uses the same Next.js API routes, FastAPI paths, HTTP-only authentication cookie and backend data contracts as version 1.0.0.

## New UI dependencies

- `gsap`
- `@gsap/react`

See `UI_UPGRADE.md` for the full handoff and mobile testing checklist.
