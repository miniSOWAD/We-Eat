type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : isForm ? options.body : JSON.stringify(options.body),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" && data && "detail" in data ? String(data.detail) : String(data || "Request failed");
    throw new ApiError(response.status, message);
  }
  return data as T;
}
