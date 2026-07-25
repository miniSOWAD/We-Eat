export const env = {
  backendUrl: process.env.BACKEND_API_URL ?? "http://localhost:8000",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  cookieName: process.env.SESSION_COOKIE_NAME ?? "we_eat_session",
};
