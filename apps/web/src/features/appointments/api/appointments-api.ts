import { apiRequest } from '@/shared/lib/api';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED_BY_FAMILY'
  | 'CANCELLED_BY_PROVIDER';

export type AppointmentRow = {
  id: string;
  providerProfileId: string;
  consumerProfileId: string;
  childId: string | null;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  /** Presente tras migración; si falta, se trata como false. */
  requestsAlternativeSchedule?: boolean;
  noteFromFamily: string | null;
  createdAt: string;
  updatedAt: string;
  providerProfile: {
    id: string;
    fullName: string | null;
    city: string | null;
    photoUrl: string | null;
  };
  consumerProfile: {
    id: string;
    fullName: string | null;
    phone: string | null;
    city: string | null;
  };
  child: { id: string; firstName: string } | null;
};

export function listMyAppointments(getToken: () => Promise<string | null>) {
  return apiRequest<AppointmentRow[]>('/appointments/me', { getToken });
}

export function listProviderAppointments(getToken: () => Promise<string | null>) {
  return apiRequest<AppointmentRow[]>('/appointments/provider/me', {
    getToken,
  });
}

export function createAppointment(
  getToken: () => Promise<string | null>,
  body: {
    providerProfileId: string;
    startsAt: string;
    endsAt: string;
    childId: string;
    noteFromFamily?: string;
    requestsAlternativeSchedule?: boolean;
  },
) {
  return apiRequest<AppointmentRow>('/appointments', {
    method: 'POST',
    body,
    getToken,
  });
}

export function patchAppointment(
  getToken: () => Promise<string | null>,
  appointmentId: string,
  body: { status: AppointmentStatus },
) {
  return apiRequest<AppointmentRow>(`/appointments/${appointmentId}`, {
    method: 'PATCH',
    body,
    getToken,
  });
}
