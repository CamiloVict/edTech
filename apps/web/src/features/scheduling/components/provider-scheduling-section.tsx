'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  listMyAvailabilityBlocks,
} from '@/features/availability/api/availability-api';
import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import { AvailabilityFullCalendar } from '@/features/scheduling/components/availability-full-calendar';
import {
  listProviderAppointments,
  patchAppointment,
  type AppointmentRow,
} from '@/features/appointments/api/appointments-api';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Field, Input } from '@/shared/components/ui/field';

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

function blockRange(isoStart: string, isoEnd: string, isAllDay: boolean, tz: string) {
  const base = formatApptRange(isoStart, isoEnd);
  return isAllDay ? `${base} (día completo · ${tz})` : base;
}

function queryErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

export function ProviderSchedulingSection() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const isProvider = bootstrapQuery.data?.user.role === 'PROVIDER';

  const blocksQuery = useQuery({
    queryKey: ['availability', 'me', 'blocks'],
    queryFn: () => listMyAvailabilityBlocks(getToken),
    enabled: isProvider,
  });

  const apptsQuery = useQuery({
    queryKey: ['appointments', 'provider', 'me'],
    queryFn: () => listProviderAppointments(getToken),
    enabled: isProvider,
  });

  const [startsLocal, setStartsLocal] = useState('');
  const [endsLocal, setEndsLocal] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [timezone, setTimezone] = useState(
    () =>
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : 'UTC',
  );

  const createBlockMut = useMutation({
    mutationFn: (vars: {
      startsAt: string;
      endsAt: string;
      isAllDay: boolean;
    }) =>
      createAvailabilityBlock(getToken, {
        startsAt: vars.startsAt,
        endsAt: vars.endsAt,
        isAllDay: vars.isAllDay,
        timezone: timezone.trim() || 'UTC',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', 'me', 'blocks'] });
      qc.invalidateQueries({ queryKey: ['provider-detail'] });
      setStartsLocal('');
      setEndsLocal('');
    },
  });

  const deleteBlockMut = useMutation({
    mutationFn: (id: string) => deleteAvailabilityBlock(getToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', 'me', 'blocks'] });
      qc.invalidateQueries({ queryKey: ['provider-detail'] });
    },
  });

  const patchApptMut = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: AppointmentRow['status'];
    }) => patchAppointment(getToken, id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', 'provider', 'me'] });
    },
  });

  const pending = useMemo(
    () =>
      (apptsQuery.data ?? []).filter((a) => a.status === 'PENDING'),
    [apptsQuery.data],
  );

  const other = useMemo(
    () =>
      (apptsQuery.data ?? []).filter((a) => a.status !== 'PENDING'),
    [apptsQuery.data],
  );

  if (bootstrapQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Comprobando tu sesión…</p>
    );
  }

  if (bootstrapQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <p className="font-semibold">No se pudo cargar tu sesión</p>
        <p className="mt-1">{queryErrorMessage(bootstrapQuery.error)}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 text-xs"
          onClick={() => bootstrapQuery.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!isProvider) {
    return (
      <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
        Solo los educadores pueden gestionar disponibilidad y citas. Si acabas
        de cambiar de rol, vuelve a entrar o recarga la página.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {patchApptMut.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">No se pudo actualizar la cita</p>
          <p className="mt-1">{queryErrorMessage(patchApptMut.error)}</p>
          <p className="mt-2 text-xs text-red-800/90">
            Si choca con otra cita ya confirmada, cancela o reprograma la otra
            antes de confirmar esta.
          </p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border-2 border-accent/45 bg-accent-soft/20 shadow-sm ring-1 ring-accent/20">
        <div className="border-b border-accent/25 bg-accent-soft/30 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Solicitudes pendientes
            </h2>
            {!apptsQuery.isLoading && !apptsQuery.isError && pending.length > 0 ? (
              <span
                className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white tabular-nums"
                aria-label={`${pending.length} solicitudes pendientes`}
              >
                {pending.length}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada solicitud va ligada al alumno o alumna. Confirma o rechaza para
            actualizar tu agenda.
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {apptsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p className="font-semibold">No se pudieron cargar las citas</p>
              <p className="mt-1">{queryErrorMessage(apptsQuery.error)}</p>
              <p className="mt-2 text-xs text-red-800/90">
                Si ves 401 o 403, la sesión puede haber caducado: cierra sesión y
                entra de nuevo. Si el mensaje es “User not found”, visita{' '}
                <span className="font-medium">Mi espacio</span> para sincronizar.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3 text-xs"
                onClick={() => apptsQuery.refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : apptsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando citas…</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {pending.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-accent/50 bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Pendiente
                          </span>
                          {Boolean(a.requestsAlternativeSchedule) ? (
                            <span className="rounded-md border border-accent/40 bg-accent-soft/40 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Horario propuesto
                            </span>
                          ) : null}
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {a.child?.firstName ?? '— (sin indicar)'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Familia:{' '}
                          <span className="font-medium text-foreground">
                            {a.consumerProfile.fullName?.trim() || '—'}
                          </span>
                        </p>
                        <p className="text-sm font-semibold tabular-nums text-primary">
                          {formatApptRange(a.startsAt, a.endsAt)}
                        </p>
                        {a.noteFromFamily ? (
                          <p className="line-clamp-3 rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed text-foreground">
                            <span className="font-semibold text-primary">Nota: </span>
                            {a.noteFromFamily}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          className="min-w-28 bg-accent px-4 py-2 text-sm text-primary shadow-sm hover:bg-accent-hover"
                          disabled={patchApptMut.isPending}
                          onClick={() =>
                            patchApptMut.mutate({ id: a.id, status: 'CONFIRMED' })
                          }
                        >
                          Confirmar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-w-28 px-4 py-2 text-sm"
                          disabled={patchApptMut.isPending}
                          onClick={() =>
                            patchApptMut.mutate({ id: a.id, status: 'DECLINED' })
                          }
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {patchApptMut.isPending ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Actualizando solicitud…
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-foreground">Disponibilidad (ventanas)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea bloques en los que las familias pueden pedir cita (incluye días
          completos para babysitting si lo necesitas).
        </p>
        <div className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/20 px-3 py-2 text-xs text-foreground sm:text-sm">
          <p className="font-semibold">Calendario</p>
          <p className="mt-1 text-muted-foreground">
            En <span className="font-medium">Mes</span>,{' '}
            <span className="font-medium">Semana</span> o{' '}
            <span className="font-medium">Día</span>, arrastra para marcar una
            ventana. Las familias solo podrán reservar dentro de esos rangos.
            Pulsa un bloque existente para eliminarlo.
          </p>
        </div>
        {blocksQuery.isError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-semibold">No se pudo cargar la disponibilidad</p>
            <p className="mt-1">{queryErrorMessage(blocksQuery.error)}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 text-xs"
              onClick={() => blocksQuery.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : blocksQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando calendario…</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm sm:p-3">
            <AvailabilityFullCalendar
              blocks={blocksQuery.data ?? []}
              editable
              height={640}
              initialView="timeGridWeek"
              onCreateRange={(range) => createBlockMut.mutate(range)}
              onDeleteBlock={(id) => deleteBlockMut.mutate(id)}
            />
          </div>
        )}
        {createBlockMut.isError ? (
          <p className="mt-2 text-sm text-red-700">
            {createBlockMut.error instanceof Error
              ? createBlockMut.error.message
              : 'No se pudo crear el bloque'}
          </p>
        ) : null}
        <h3 className="mt-6 text-sm font-bold text-foreground">
          Añadir con fecha y hora manual
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Alternativa al arrastre: indica inicio y fin exactos (la zona horaria
          aplica también a los bloques creados desde el calendario).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Inicio">
            <Input
              type="datetime-local"
              value={startsLocal}
              onChange={(e) => setStartsLocal(e.target.value)}
            />
          </Field>
          <Field label="Fin">
            <Input
              type="datetime-local"
              value={endsLocal}
              onChange={(e) => setEndsLocal(e.target.value)}
            />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
          />
          Marcar como día completo (referencia de zona)
        </label>
        <Field label="Zona horaria (IANA)">
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Europe/Madrid"
          />
        </Field>
        <Button
          className="mt-3"
          variant="primary"
          disabled={
            createBlockMut.isPending || !startsLocal || !endsLocal
          }
          onClick={() =>
            createBlockMut.mutate({
              startsAt: new Date(startsLocal).toISOString(),
              endsAt: new Date(endsLocal).toISOString(),
              isAllDay,
            })
          }
        >
          {createBlockMut.isPending ? 'Guardando…' : 'Añadir ventana'}
        </Button>

        <h3 className="mt-6 text-sm font-bold text-foreground">Ventanas guardadas (lista)</h3>
        {(blocksQuery.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no hay ventanas. Las familias solo pueden solicitar citas dentro
            de estos rangos.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {(blocksQuery.data ?? []).map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  {blockRange(b.startsAt, b.endsAt, b.isAllDay, b.timezone)}
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-700 underline"
                  disabled={deleteBlockMut.isPending}
                  onClick={() => deleteBlockMut.mutate(b.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-foreground">Otras citas</h2>
        {other.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Confirmadas y cerradas aparecerán aquí.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {other.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-foreground">
                  <span className="text-primary">
                    {a.child?.firstName ?? '—'}
                  </span>
                  {' · '}
                  {a.consumerProfile.fullName?.trim() || 'Familia'}
                </span>
                <span className="text-muted-foreground">
                  {formatApptRange(a.startsAt, a.endsAt)} · {a.status}
                </span>
                {a.status === 'CONFIRMED' ? (
                  <Button
                    variant="ghost"
                    className="self-start text-xs text-red-800"
                    disabled={patchApptMut.isPending}
                    onClick={() =>
                      patchApptMut.mutate({
                        id: a.id,
                        status: 'CANCELLED_BY_PROVIDER',
                      })
                    }
                  >
                    Cancelar cita
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
