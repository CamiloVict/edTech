'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import {
  patchAppointment,
  type AppointmentRow,
} from '@/features/appointments/api/appointments-api';
import {
  APPOINTMENT_STATUS_LABEL_ES,
  apptStatusBadgeClass,
  apptStatusCardClass,
} from '@/features/appointments/lib/appointment-status-ui';
import { Button } from '@/shared/components/ui/button';

function formatApptRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    return `${a.toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })} – ${b.toLocaleTimeString('es', { timeStyle: 'short' })}`;
  } catch {
    return `${isoStart} – ${isoEnd}`;
  }
}

export function ConsumerUpcomingAppointmentsPanel({
  appointments,
  maxItems = 3,
  title = 'Próximas citas',
  emptyMessage,
  manageHref,
  manageLabel = 'Ver todas las citas',
  onManageClick,
}: {
  appointments: AppointmentRow[];
  maxItems?: number;
  title?: string;
  emptyMessage?: string;
  manageHref?: string;
  manageLabel?: string;
  onManageClick?: () => void;
}) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  const cancelMut = useMutation({
    mutationFn: (id: string) =>
      patchAppointment(getToken, id, { status: 'CANCELLED_BY_FAMILY' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', 'me'] });
    },
  });

  const rows = appointments.slice(0, maxItems);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-primary">{title}</h2>
        {manageHref ? (
          <Link
            href={manageHref}
            className="text-left text-sm font-semibold text-primary underline underline-offset-2 sm:text-right"
          >
            {manageLabel}
          </Link>
        ) : onManageClick ? (
          <button
            type="button"
            onClick={onManageClick}
            className="text-left text-sm font-semibold text-primary underline underline-offset-2 sm:text-right"
          >
            {manageLabel}
          </button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {emptyMessage ??
            'No hay citas en este listado. Explora educadores y solicita una dentro de sus ventanas publicadas.'}
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((a) => (
            <li
              key={a.id}
              className={`px-4 py-3 text-sm ${apptStatusCardClass(a.status)}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Para {a.child?.firstName ?? '—'}
                  </p>
                  <p className="font-semibold text-foreground">
                    {a.providerProfile.fullName?.trim() || 'Educador'}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {formatApptRange(a.startsAt, a.endsAt)}
                  </p>
                  <p className="mt-1.5">
                    <span className={apptStatusBadgeClass(a.status)}>
                      {APPOINTMENT_STATUS_LABEL_ES[a.status]}
                    </span>
                  </p>
                  {a.requestsAlternativeSchedule ? (
                    <p className="mt-1 text-xs font-medium text-violet-700">
                      Horario propuesto (el educador lo revisa)
                    </p>
                  ) : null}
                </div>
                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <Button
                    variant="secondary"
                    className="shrink-0 text-xs"
                    disabled={cancelMut.isPending}
                    onClick={() => cancelMut.mutate(a.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
