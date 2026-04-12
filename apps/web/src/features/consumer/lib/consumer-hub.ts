/** Secciones del hub familiar (una sola ruta `/dashboard/consumer`). */
export type ConsumerHubSection = 'resumen' | 'familia' | 'citas';

const BASE = '/dashboard/consumer';

export function parseConsumerHubSection(
  raw: string | null,
): ConsumerHubSection {
  if (raw === 'familia' || raw === 'citas') return raw;
  return 'resumen';
}

export function consumerHubHref(seccion: ConsumerHubSection): string {
  if (seccion === 'resumen') return BASE;
  return `${BASE}?seccion=${seccion}`;
}
