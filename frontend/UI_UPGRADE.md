# We Eat UI Upgrade v1.2.0

## Identity and account UI

- Username registration and username/email login.
- Header account action shows only the profile avatar.
- Avatar fallback uses the first two alphanumeric characters of the display name.
- Account dropdown contains Dashboard, Settings and Logout.
- Pointer exit uses a 200 ms close delay.
- Profile Settings supports authenticated Cloudinary image upload.

## Dashboard UI

- The dashboard shell is defined at `app/dashboard/layout.tsx`, so its navigation persists across every dashboard subpage.
- Navigation is role-aware.
- Desktop uses a sticky sidebar.
- Narrow screens use a horizontally scrollable dashboard menu above the page content.
- Administration tables remain horizontally scrollable instead of widening the viewport.

## Theme

- Night mode appears beside the We Eat brand.
- The preference is saved in `localStorage`.
- A boot script applies the stored/system theme before hydration.
- Sparkles icons were removed.
