function normalizeBackendUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
}

export const env = {
  backendUrl: normalizeBackendUrl(process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000"),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  cookieName: process.env.SESSION_COOKIE_NAME ?? "we_eat_session",
};
