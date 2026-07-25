import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set(env.cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
