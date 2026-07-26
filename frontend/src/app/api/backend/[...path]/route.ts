import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { backendUnavailable } from "@/lib/upstream";

const allowedPrefixes = [
  "auth/request-registration-otp", "auth/verify-otp", "auth/request-password-reset", "auth/reset-password", "auth/change-password",
  "users", "listings", "favorites", "orders", "exchanges", "reviews", "reports", "admin",
];

function isAllowed(path: string): boolean {
  if (!path || path.includes("..") || path.includes("//")) return false;
  return allowedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await context.params;
  const path = parts.join("/");
  if (!isAllowed(path)) return NextResponse.json({ detail: "Endpoint is not allowed by the Next.js proxy." }, { status: 403 });

  try {
    const store = await cookies();
    const token = store.get(env.cookieName)?.value;
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    headers.set("accept", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);
    const method = request.method;
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const upstream = await fetch(`${env.backendUrl}/api/v1/${path}${request.nextUrl.search}`, { method, headers, body, cache: "no-store", redirect: "manual" });
    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "x-upstream-status": String(upstream.status) } });
  } catch (error) { return backendUnavailable(error); }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
