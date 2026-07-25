import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { UserMe } from "@/types";

export async function backendFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${env.backendUrl}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: init.cache ?? "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail ?? "Backend request failed");
  return data as T;
}

export async function getSession(): Promise<UserMe | null> {
  const store = await cookies();
  const token = store.get(env.cookieName)?.value;
  if (!token) return null;
  try {
    return await backendFetch<UserMe>("/auth/me", {}, token);
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(env.cookieName)?.value;
}
