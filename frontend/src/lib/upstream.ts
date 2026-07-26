import { NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

export async function readUpstreamPayload(response: Response): Promise<JsonObject> {
  const text = await response.text();
  if (!text.trim()) {
    return {
      detail: response.ok
        ? "The service returned an empty response."
        : "The request could not be completed.",
    };
  }

  try {
    return JSON.parse(text) as JsonObject;
  } catch {
    return { detail: "The service returned an unexpected response." };
  }
}

export function backendUnavailable(): NextResponse {
  return NextResponse.json(
    { detail: "The service is temporarily unavailable. Please try again shortly." },
    { status: 503 },
  );
}
