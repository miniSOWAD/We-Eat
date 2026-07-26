# We Eat frontend v1.2.2 upgrade

## What changed

- Removed administrator-only infrastructure diagnostic cards from the dashboard.
- Replaced technical implementation wording across sign-in, registration, password reset, saved food, profile settings, listing creation, and public informational pages.
- Added generic service-error messages that do not expose infrastructure names or environment details.
- Rebuilt dark-mode contrast for the community feed and strengthened dark styles for badges, cards, forms, tables, empty states, authentication screens, listing details, hero illustrations, and buttons.
- Refined GSAP route entrances, scroll reveals, card staggering, button microinteractions, homepage parallax, and floating hero motion.
- Preserved `prefers-reduced-motion` behavior.

## Apply the full frontend

1. Preserve your current `frontend/.env.local`.
2. Replace the current frontend files with the v1.2.2 frontend.
3. Run:

```powershell
cd "D:\PROJ\We Eat\frontend"
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run check
npm run dev
```

## Apply the patch only

Copy the contents of the patch `frontend` folder over your existing frontend and replace matching files. Then clear `.next` and restart.

## Backend compatibility

No FastAPI endpoint, request payload, response type, authentication flow, database model, or Cloudinary upload contract was changed.
