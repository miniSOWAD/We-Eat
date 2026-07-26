import { NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

export async function readUpstreamPayload(response: Response): Promise<JsonObject> {
  const text = await response.text();
  if (!text.trim()) return { detail: response.ok ? "The backend returned an empty response." : `Backend request failed with HTTP ${response.status}.` };
  try { return JSON.parse(text) as JsonObject; }
  catch { return { detail: `The backend returned a non-JSON response (HTTP ${response.status}).`, upstream_response: text.slice(0, 500) }; }
}

export function backendUnavailable(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "Unknown network error";
  return NextResponse.json({ detail: "FastAPI backend is unreachable. Check BACKEND_API_URL and the cloud /health endpoint.", error: message }, { status: 503 });
}
