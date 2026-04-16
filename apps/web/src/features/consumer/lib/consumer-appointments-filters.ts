import type { AppointmentRow } from '@/features/appointments/api/appointments-api';

const RELEVANT_FOR_EXPLORE_BANNER = new Set<AppointmentRow['status']>([
  'PENDING',
  'CONFIRMED',
  'DECLINED',
  'CANCELLED_BY_FAMILY',
  'CANCELLED_BY_PROVIDER',
]);

const MS_7D = 7 * 86400000;

/**
 * Citas con inicio o fin en la ventana [ahora, ahora + 7 días], cualquier estado
 * relevante (pendiente, confirmada, rechazada o cancelada).
 */
export function filterConsumerAppointmentsNext7Days(
  all: AppointmentRow[],
  now: Date = new Date(),
): AppointmentRow[] {
  const t0 = now.getTime();
  const t1 = t0 + MS_7D;
  return all
    .filter((a) => {
      if (!RELEVANT_FOR_EXPLORE_BANNER.has(a.status)) return false;
      const s = new Date(a.startsAt).getTime();
      const e = new Date(a.endsAt).getTime();
      if (Number.isNaN(s) || Number.isNaN(e)) return false;
      return e >= t0 && s <= t1;
    })
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}
