# We Eat frontend v1.2.2

This release removes technical implementation details from the public interface, improves dark-mode contrast across the site, and refines GSAP route, reveal, stagger, hover and hero animations.

## Run

```powershell
npm install
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run check
npm run dev
```

Keep your existing `.env.local`. Backend routes and data contracts are unchanged.
