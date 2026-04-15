import type { SyncResponse } from '@/shared/types/bootstrap';

/**
 * POST /users/sync desde el servidor (RSC). Evita depender del cliente y del
 * estado de React Query para la primera redirección tras iniciar sesión.
 */
export async function syncUserWithToken(token: string): Promise<SyncResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const url = `${base.replace(/\/$/, '')}/v1/users/sync`;
  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        typeof text === 'string' && text.length < 500
          ? text
          : `Error ${res.status}`,
      );
    }
    return JSON.parse(text) as SyncResponse;
  } finally {
    clearTimeout(kill);
  }
}
