import type { AppointmentRow } from '@/features/appointments/api/appointments-api';

const HELP_COMPLETED_DAYS = 14;

const blocked = new Set([
  'DECLINED',
  'CANCELLED_BY_FAMILY',
  'CANCELLED_BY_PROVIDER',
]);

/**
 * Misma ventana que el API: citas activas o completadas recientes admiten «Obtener ayuda».
 */
export function appointmentEligibleForHelp(
  appointment: AppointmentRow,
  now = new Date(),
): boolean {
  if (blocked.has(appointment.status)) return false;
  if (appointment.status === 'COMPLETED') {
    const end = new Date(appointment.endsAt);
    const deadline = new Date(end);
    deadline.setDate(deadline.getDate() + HELP_COMPLETED_DAYS);
    return now <= deadline;
  }
  return true;
}
