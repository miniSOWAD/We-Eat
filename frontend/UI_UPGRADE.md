# We Eat UI Upgrade — v1.1.0

## Scope

This release changes the frontend presentation only. It does not change:

- Next.js API proxy routes
- FastAPI endpoint paths
- request or response payload contracts
- authentication cookie behavior
- Neon PostgreSQL logic
- Cloudinary upload flow
- role and permission logic

## Main improvements

- Rebuilt smartphone header behavior; no broken stacked dropdown navigation.
- Added a five-item glassmorphism bottom navigation bar for mobile screens.
- Added safe-area spacing for modern phones.
- Rebuilt the homepage with a mobile-app preview, trust cues, workflow details and stronger calls to action.
- Added GSAP route, hero, scroll-reveal, stagger and floating-card animation.
- Added reduced-motion support.
- Rebuilt the footer with a professional multi-column structure and mobile layout.
- Improved listing discovery, filters, category shortcuts and listing cards.
- Expanded How It Works and Food Safety pages.
- Reorganized the Share Food form into clear mobile-friendly sections.
- Improved login, registration and password-reset presentation.
- Improved dashboard navigation, metrics, instructions and responsive behavior.
- Improved listing detail, admin, moderator and empty-state presentation.

## Installation over an existing local copy

1. Preserve any local `.env` or `.env.local` file.
2. Copy the upgraded files over the existing frontend folder.
3. Install the two new animation dependencies by running `npm install`.
4. Delete the old `.next` folder.
5. Start the development server.

```powershell
cd "D:\PROJ\We Eat\frontend"
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
```

## Mobile checks

Test at widths of 320, 360, 375, 390, 412 and 430 pixels.

Verify:

- The top header contains only the compact brand and account action.
- The bottom navigation remains inside the viewport.
- The central Share action does not overlap page buttons.
- Forms do not create horizontal scrolling.
- Listing cards remain one column on narrow screens.
- Footer content remains readable above the bottom navigation.
- Dashboard navigation scrolls horizontally inside its own card.
- Admin tables scroll inside their container rather than widening the page.

## Validation completed in the handoff environment

- TypeScript/TSX syntax transpilation: passed for all source files.
- CSS parser validation: passed for all stylesheets.
- Internal import resolution: passed.
- JSON parsing: passed.
- API route, `src/lib`, and `src/types` directories are byte-for-byte unchanged from v1.0.0.
- Backend/API route literal comparison found no removed or added backend endpoint paths.

## Validation limitation

The handoff environment could not resolve the npm registry, so a fresh `npm install`, Next.js production build, ESLint run and dependency-backed TypeScript check could not be executed here. Run `npm run check` and `npm run build` after installing dependencies locally.
