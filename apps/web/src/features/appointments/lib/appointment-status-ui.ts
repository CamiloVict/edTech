import type { AppointmentRow } from '@/features/appointments/api/appointments-api';

export type AppointmentStatus = AppointmentRow['status'];

export const APPOINTMENT_STATUS_LABEL_ES: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente de confirmación',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Rechazada',
  CANCELLED_BY_FAMILY: 'Cancelada (familia)',
  CANCELLED_BY_PROVIDER: 'Cancelada (educador)',
  COMPLETED: 'Completada',
};

/** Tarjetas / filas con borde y fondo suave según estado. */
export function apptStatusCardClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-card appt-status-card-pending';
  if (status === 'CONFIRMED') return 'appt-status-card appt-status-card-confirmed';
  if (status === 'COMPLETED') return 'appt-status-card appt-status-card-confirmed';
  return 'appt-status-card appt-status-card-cancelled';
}

/** Historial: acento lateral por estado. */
export function apptStatusHistoryClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-history appt-status-history-pending';
  if (status === 'CONFIRMED') return 'appt-status-history appt-status-history-confirmed';
  if (status === 'COMPLETED') return 'appt-status-history appt-status-history-confirmed';
  return 'appt-status-history appt-status-history-cancelled';
}

/** Pastilla compacta de estado (listados, cabeceras de tarjeta). */
export function apptStatusBadgeClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-badge appt-status-badge-pending';
  if (status === 'CONFIRMED') return 'appt-status-badge appt-status-badge-confirmed';
  if (status === 'COMPLETED') return 'appt-status-badge appt-status-badge-confirmed';
  return 'appt-status-badge appt-status-badge-cancelled';
}

/** Eventos FullCalendar (familia): colores por estado, no por hijo. */
export function apptCalendarEventClasses(status: AppointmentStatus): string[] {
  let cal = 'appt-cal-confirmed';
  if (status === 'PENDING') cal = 'appt-cal-pending';
  else if (status === 'COMPLETED') {
    cal = 'appt-cal-confirmed';
  } else if (
    status === 'DECLINED' ||
    status === 'CANCELLED_BY_FAMILY' ||
    status === 'CANCELLED_BY_PROVIDER'
  ) {
    cal = 'appt-cal-cancelled';
  }
  return ['consumer-appt-cal-event', cal];
}
