import type { AppointmentRow } from '@/features/appointments/api/appointments-api';

export type AppointmentStatus = AppointmentRow['status'];

export const APPOINTMENT_STATUS_LABEL_ES: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente de confirmación',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Sesión terminada',
  DECLINED: 'Rechazada',
  CANCELLED_BY_FAMILY: 'Cancelada (familia)',
  CANCELLED_BY_PROVIDER: 'Cancelada (educador)',
};

/** Tarjetas / filas con borde y fondo suave según estado. */
export function apptStatusCardClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-card appt-status-card-pending';
  if (status === 'CONFIRMED') return 'appt-status-card appt-status-card-confirmed';
  if (status === 'COMPLETED') return 'appt-status-card appt-status-card-completed';
  return 'appt-status-card appt-status-card-cancelled';
}

/** Historial: acento lateral por estado. */
export function apptStatusHistoryClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-history appt-status-history-pending';
  if (status === 'CONFIRMED') return 'appt-status-history appt-status-history-confirmed';
  if (status === 'COMPLETED') return 'appt-status-history appt-status-history-completed';
  return 'appt-status-history appt-status-history-cancelled';
}

/** Pastilla compacta de estado (listados, cabeceras de tarjeta). */
export function apptStatusBadgeClass(status: AppointmentStatus): string {
  if (status === 'PENDING') return 'appt-status-badge appt-status-badge-pending';
  if (status === 'CONFIRMED') return 'appt-status-badge appt-status-badge-confirmed';
  if (status === 'COMPLETED') return 'appt-status-badge appt-status-badge-completed';
  return 'appt-status-badge appt-status-badge-cancelled';
}

/** Eventos FullCalendar (familia): colores por estado, no por hijo. */
export function apptCalendarEventClasses(status: AppointmentStatus): string[] {
  return [
    'consumer-appt-cal-event',
    status === 'PENDING'
      ? 'appt-cal-pending'
      : status === 'COMPLETED'
        ? 'appt-cal-completed'
        : 'appt-cal-confirmed',
  ];
}
