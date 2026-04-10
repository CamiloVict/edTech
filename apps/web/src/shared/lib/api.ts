export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  getToken: () => Promise<string | null>;
};

export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = await options.getToken();
  if (!token) {
    throw new ApiError(401, 'No session token');
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError(500, 'NEXT_PUBLIC_API_URL is not set');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/v1${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : Array.isArray((data as { message?: unknown })?.message)
          ? JSON.stringify((data as { message: unknown }).message)
          : text || res.statusText;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}
