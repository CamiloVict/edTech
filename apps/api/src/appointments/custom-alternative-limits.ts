/** Misma ventana que la lista rápida en web: N fechas UTC consecutivas desde hoy. */
export const ALTERNATIVE_SCHEDULE_UTC_DAY_SPAN = 3;

export function utcMaxInstantForAlternativeRequest(now = new Date()): Date {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  return new Date(
    Date.UTC(
      y,
      m,
      d + (ALTERNATIVE_SCHEDULE_UTC_DAY_SPAN - 1),
      23,
      59,
      59,
      999,
    ),
  );
}
