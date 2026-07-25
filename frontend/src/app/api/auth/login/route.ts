import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch(`${env.backendUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) return NextResponse.json(data, { status: response.status });
  const result = NextResponse.json({ user: data.user });
  result.cookies.set(env.cookieName, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return result;
}
