import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { backendUnavailable, readUpstreamPayload } from "@/lib/upstream";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await fetch(`${env.backendUrl}/api/v1/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body, cache: "no-store",
    });
    const data = await readUpstreamPayload(response);
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    if (typeof data.access_token !== "string" || !data.user) return NextResponse.json({ detail: "Backend login response is incomplete." }, { status: 502 });
    const result = NextResponse.json({ user: data.user });
    result.cookies.set(env.cookieName, data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return result;
  } catch (error) { return backendUnavailable(error); }
}
