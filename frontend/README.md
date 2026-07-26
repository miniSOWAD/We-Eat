# We Eat Frontend v1.3.0

Mobile-first Next.js frontend for the We Eat food-sharing marketplace.

## v1.3.0

- Private proposal list on each listing-owner detail page.
- Public proposal counters without exposing proposal details.
- Accepted handover dock with the listing image, schedule, pickup details and **Received** action.
- **Bid in progress** status for reserved food.
- Provider **Delivered** action remains disabled until the recipient confirms receipt.
- `public/logo.svg` is used across the site; a matching app icon and web manifest are included.
- GSAP entrance animation runs once per full page load instead of replaying while scrolling.

## Run locally

```powershell
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run check
npm run dev
```

Preserve your existing `.env.local`:

```env
BACKEND_API_URL=https://YOUR-FASTAPI-CLOUD-DOMAIN
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=we_eat_session
```
