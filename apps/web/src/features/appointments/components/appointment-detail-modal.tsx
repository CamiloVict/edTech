'use client';

import { useCallback, useEffect } from 'react';

import type { AppointmentRow } from '@/features/appointments/api/appointments-api';
import {
  APPOINTMENT_STATUS_LABEL_ES,
  apptStatusBadgeClass,
} from '@/features/appointments/lib/appointment-status-ui';
import {
  appointmentResolvedAttendance,
  appointmentShowAddress,
  appointmentShowMeetingLink,
  dwellingLabelEs,
  formatAddressForMaps,
  googleMapsSearchUrl,
  wazeSearchUrl,
} from '@/features/appointments/lib/appointment-address';
import type { ServiceMode } from '@/shared/types/bootstrap';
import { buttonStyles } from '@/shared/components/ui/button';

function formatRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    return `${a.toLocaleString('es', {
      dateStyle: 'full',
      timeStyle: 'short',
    })} – ${b.toLocaleTimeString('es', { timeStyle: 'short' })}`;
  } catch {
    return `${isoStart} – ${isoEnd}`;
  }
}

export type AppointmentViewerRole = 'CONSUMER' | 'PROVIDER';

export function AppointmentDetailModal({
  open,
  onClose,
  appointment,
  viewerRole,
}: {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentRow | null;
  viewerRole: AppointmentViewerRole;
}) {
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onKey]);

  if (!open || !appointment) return null;

  const mode = appointment.providerProfile.serviceMode as ServiceMode | null;
  const resolved = appointmentResolvedAttendance({
    providerProfile: appointment.providerProfile,
    attendanceMode: appointment.attendanceMode ?? null,
  });
  const venue = appointment.inPersonVenueHost ?? 'CONSUMER';
  const addressProfile =
    venue === 'PROVIDER'
      ? appointment.providerProfile
      : appointment.consumerProfile;
  const addressLine = formatAddressForMaps({
    streetAddress: addressProfile.streetAddress ?? null,
    postalCode: addressProfile.postalCode ?? null,
    city: addressProfile.city ?? null,
    unitOrBuilding: addressProfile.unitOrBuilding ?? null,
    dwellingType: addressProfile.dwellingType ?? null,
  });
  const mapsQuery = addressLine.trim();
  const counterpartyName =
    viewerRole === 'CONSUMER'
      ? appointment.providerProfile.fullName?.trim() || 'Educador/a'
      : appointment.consumerProfile.fullName?.trim() || 'Familia';

  const showMeet = appointmentShowMeetingLink({
    providerProfile: appointment.providerProfile,
    attendanceMode: appointment.attendanceMode ?? null,
  });
  const showAddress = appointmentShowAddress({
    providerProfile: appointment.providerProfile,
    attendanceMode: appointment.attendanceMode ?? null,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appt-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-border bg-card px-5 py-4">
          <div>
            <h2 id="appt-detail-title" className="text-lg font-bold text-foreground">
              Detalle de la cita
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo tú y {counterpartyName} veéis esta información en el contexto de esta cita.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm">
          <div>
            <span className={apptStatusBadgeClass(appointment.status)}>
              {APPOINTMENT_STATUS_LABEL_ES[appointment.status]}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Horario
            </p>
            <p className="mt-1 text-foreground">{formatRange(appointment.startsAt, appointment.endsAt)}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {viewerRole === 'CONSUMER' ? 'Educador/a' : 'Familia'}
            </p>
            <p className="mt-1 font-medium text-foreground">{counterpartyName}</p>
            {appointment.child ? (
              <p className="mt-0.5 text-muted-foreground">
                Niño/a: <span className="font-medium text-foreground">{appointment.child.firstName}</span>
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Modalidad del servicio
            </p>
            <p className="mt-1 text-foreground">
              {mode === 'ONLINE' && 'En línea'}
              {mode === 'IN_PERSON' && 'Presencial'}
              {mode === 'HYBRID' ? (
                <>
                  Híbrido (ofrece presencial y en línea)
                  {resolved ? (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      Esta cita: {resolved === 'ONLINE' ? 'En línea' : 'Presencial'}
                    </span>
                  ) : null}
                </>
              ) : null}
              {!mode && '—'}
            </p>
          </div>

          {showAddress ? (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {venue === 'PROVIDER'
                  ? 'Ubicación presencial (espacio del educador/a)'
                  : 'Ubicación presencial (domicilio de la familia)'}
              </p>
              {addressProfile.dwellingType ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tipo:{' '}
                  <span className="font-medium text-foreground">
                    {dwellingLabelEs(addressProfile.dwellingType)}
                  </span>
                </p>
              ) : null}
              {mapsQuery ? (
                <>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">{addressLine}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={googleMapsSearchUrl(mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonStyles('primary', 'px-3 py-2 text-xs')}
                    >
                      Abrir en Google Maps
                    </a>
                    <a
                      href={wazeSearchUrl(mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonStyles('secondary', 'px-3 py-2 text-xs')}
                    >
                      Abrir en Waze
                    </a>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-amber-800">
                  Falta completar la dirección en el perfil de{' '}
                  {venue === 'PROVIDER' ? 'el educador' : 'la familia'} para poder mostrar mapas.
                </p>
              )}
            </div>
          ) : null}

          {showMeet ? (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Enlace de la reunión (Meet, Zoom…)
              </p>
              {appointment.meetingUrl?.trim() ? (
                <a
                  href={appointment.meetingUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block break-all text-sm font-semibold text-primary underline underline-offset-2"
                >
                  {appointment.meetingUrl.trim()}
                </a>
              ) : (
                <p className="mt-2 text-xs text-amber-800">
                  Aún no hay enlace. La familia o el educador pueden añadirlo al reservar o desde el
                  panel de la cita.
                </p>
              )}
            </div>
          ) : null}

          {appointment.noteFromFamily?.trim() ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nota de la familia
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-background px-3 py-2 text-foreground">
                {appointment.noteFromFamily.trim()}
              </p>
            </div>
          ) : null}

          {appointment.requestsAlternativeSchedule ? (
            <p className="text-xs font-medium text-violet-800">
              Esta solicitud incluye un horario distinto al publicado; el educador lo revisa.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
