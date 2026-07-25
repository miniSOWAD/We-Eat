# We Eat Frontend

Next.js App Router frontend for We Eat. Browser requests stay on the Next.js origin. The server-side proxy attaches the HTTP-only session cookie as a Bearer token when calling FastAPI.

```bash
cp .env.example .env.local
npm install
npm run dev
```
