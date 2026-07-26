type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const requestBody: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isForm
        ? (options.body as FormData)
        : JSON.stringify(options.body);

  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : String(data || "Request failed");
    throw new ApiError(response.status, message);
  }

  return data as T;
}
