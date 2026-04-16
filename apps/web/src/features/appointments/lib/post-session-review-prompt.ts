import type {
  AppointmentReviewAuthor,
  AppointmentRow,
} from '@/features/appointments/api/appointments-api';

export function reviewPromptDeferSessionKey(
  appointmentId: string,
  role: AppointmentReviewAuthor,
): string {
  return `trofo:apptReviewDefer:${appointmentId}:${role}`;
}

/** Cita completada sin valoración tuya y con menos de 2 cierres sin enviar (servidor). */
export function appointmentReviewEligible(
  appointment: AppointmentRow,
  role: AppointmentReviewAuthor,
): boolean {
  if (appointment.status !== 'COMPLETED') return false;
  const reviews = appointment.reviews ?? [];
  if (reviews.some((r) => r.authorRole === role)) return false;
  const dismissals =
    role === 'CONSUMER'
      ? (appointment.consumerReviewPromptDismissals ?? 0)
      : (appointment.providerReviewPromptDismissals ?? 0);
  return dismissals < 2;
}

/** Incluye `sessionStorage` para no reabrir en la misma visita tras «Ahora no». */
export function appointmentNeedsReviewPrompt(
  appointment: AppointmentRow,
  role: AppointmentReviewAuthor,
): boolean {
  if (!appointmentReviewEligible(appointment, role)) return false;
  if (typeof sessionStorage === 'undefined') return true;
  return !sessionStorage.getItem(reviewPromptDeferSessionKey(appointment.id, role));
}
