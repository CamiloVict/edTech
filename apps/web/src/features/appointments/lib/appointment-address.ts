import type { ProviderKind, ServiceMode } from '@/shared/types/bootstrap';

export type AddressParts = {
  streetAddress: string | null;
  postalCode: string | null;
  city: string | null;
  unitOrBuilding: string | null;
  dwellingType: 'HOUSE' | 'APARTMENT' | null;
};

export function dwellingLabelEs(t: AddressParts['dwellingType']): string {
  if (t === 'APARTMENT') return 'Apartamento';
  if (t === 'HOUSE') return 'Casa';
  return '';
}

/** Una sola línea para buscar en mapas. */
export function formatAddressForMaps(p: AddressParts): string {
  const parts: string[] = [];
  if (p.streetAddress?.trim()) parts.push(p.streetAddress.trim());
  if (p.unitOrBuilding?.trim()) parts.push(p.unitOrBuilding.trim());
  if (p.postalCode?.trim()) parts.push(p.postalCode.trim());
  if (p.city?.trim()) parts.push(p.city.trim());
  return parts.join(', ');
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function wazeSearchUrl(query: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(query)}`;
}

export type AppointmentSessionAttendance = 'IN_PERSON' | 'ONLINE';

export function isBabysitterOnlyProviderKinds(
  kinds: ProviderKind[] | undefined | null,
): boolean {
  const k = kinds ?? [];
  return k.length > 0 && k.every((x) => x === 'BABYSITTER');
}

type AppointmentAttendanceInput = {
  providerProfile: {
    serviceMode: ServiceMode | null;
    kinds?: ProviderKind[] | null;
  };
  attendanceMode: AppointmentSessionAttendance | null | undefined;
};

/** Resuelve presencial vs en línea para esta cita (incluye híbrido y filas antiguas sin `attendanceMode`). */
export function appointmentResolvedAttendance(
  a: AppointmentAttendanceInput,
): AppointmentSessionAttendance | null {
  const mode = a.providerProfile.serviceMode ?? null;
  if (mode === 'IN_PERSON') return 'IN_PERSON';
  if (mode === 'ONLINE') return 'ONLINE';
  if (mode === 'HYBRID') {
    if (isBabysitterOnlyProviderKinds(a.providerProfile.kinds)) {
      return 'IN_PERSON';
    }
    if (a.attendanceMode === 'IN_PERSON' || a.attendanceMode === 'ONLINE') {
      return a.attendanceMode;
    }
    return 'IN_PERSON';
  }
  return null;
}

export function appointmentShowMeetingLink(a: AppointmentAttendanceInput): boolean {
  return appointmentResolvedAttendance(a) === 'ONLINE';
}

export function appointmentShowAddress(a: AppointmentAttendanceInput): boolean {
  return appointmentResolvedAttendance(a) === 'IN_PERSON';
}
