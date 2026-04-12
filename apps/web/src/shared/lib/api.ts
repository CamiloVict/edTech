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
  /** Aborta el fetch tras N ms (evita spinner infinito si la API o red cuelgan). */
  timeoutMs?: number;
};

async function parseResponse<T>(res: Response): Promise<T> {
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

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError(500, 'NEXT_PUBLIC_API_URL is not set');
  }
  return base.replace(/\/$/, '');
}

/** Rutas públicas (sin sesión), mismo prefijo /v1 que el API. */
export async function publicApiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${apiBaseUrl()}/v1${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return parseResponse<T>(res);
}

export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = await options.getToken();
  if (!token) {
    throw new ApiError(401, 'No session token');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const signal =
    options.timeoutMs != null && options.timeoutMs > 0
      ? AbortSignal.timeout(options.timeoutMs)
      : undefined;

  try {
    const res = await fetch(`${apiBaseUrl()}/v1${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal,
    });
    return parseResponse<T>(res);
  } catch (e: unknown) {
    const name = e instanceof Error ? e.name : '';
    if (name === 'AbortError' || name === 'TimeoutError') {
      throw new ApiError(408, 'Tiempo de espera agotado. Comprueba la API y la red.');
    }
    throw e;
  }
}
