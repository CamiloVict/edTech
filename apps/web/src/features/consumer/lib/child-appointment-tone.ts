const TONE_COUNT = 8;

/**
 * Índice de color estable por hijo (misma familia → mismo color en calendario y listas).
 */
export function childIdToToneIndex(childId: string | null): number {
  if (!childId) return -1;
  let h = 0;
  for (let i = 0; i < childId.length; i++) {
    h = (Math.imul(31, h) + childId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % TONE_COUNT;
}

/** Clase CSS para borde de tarjeta, texto de hijo y eventos FullCalendar. */
export function appointmentChildToneClass(childId: string | null): string {
  const idx = childIdToToneIndex(childId);
  if (idx < 0) return 'consumer-appt-tone-unknown';
  return `consumer-appt-tone-${idx}`;
}
