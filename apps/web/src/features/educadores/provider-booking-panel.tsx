'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { createAppointment } from '@/features/appointments/api/appointments-api';
import { getConsumerProfile } from '@/features/consumer/api/consumer-api';
import type { ProviderDetailResponse } from '@/features/providers/api/providers-api';
import { AvailabilityFullCalendar } from '@/features/scheduling/components/availability-full-calendar';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Field, Input, Select, TextArea } from '@/shared/components/ui/field';

export type ProviderBookingViewer = {
  isSignedIn: boolean;
  canBook: boolean;
  isProviderViewer: boolean;
};

function unitLabel(unit: string): string {
  if (unit === 'HOUR') return 'por hora';
  if (unit === 'SESSION') return 'por sesión';
  if (unit === 'DAY') return 'por día';
  return unit;
}

function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

function toDatetimeLocalValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

function parseDatetimeLocal(s: string): Date | null {
  if (!s.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMinutesToDatetimeLocal(startLocal: string, minutes: number): string {
  const d = parseDatetimeLocal(startLocal);
  if (!d) return '';
  d.setMinutes(d.getMinutes() + minutes);
  return toDatetimeLocalValue(d);
}

function formatSlotSummary(startsLocal: string, endsLocal: string): string | null {
  const a = parseDatetimeLocal(startsLocal);
  const b = parseDatetimeLocal(endsLocal);
  if (!a || !b || b <= a) return null;
  const sameDay = a.toDateString() === b.toDateString();
  const d1 = a.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const t1 = a.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const t2 = b.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (sameDay) {
    return `${d1}, ${t1} – ${t2}`;
  }
  const d2 = b.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `${d1} ${t1} → ${d2} ${t2}`;
}

export function ProviderBookingPanel({
  providerProfileId,
  viewer,
  detail,
  detailLoading,
  detailError,
}: {
  providerProfileId: string;
  viewer: ProviderBookingViewer;
  detail: ProviderDetailResponse | null | undefined;
  detailLoading: boolean;
  detailError: boolean;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const consumerQuery = useQuery({
    queryKey: ['consumer-profile'],
    queryFn: () => getConsumerProfile(getToken),
    enabled: viewer.canBook,
  });

  const [startsLocal, setStartsLocal] = useState('');
  const [endsLocal, setEndsLocal] = useState('');
  const [note, setNote] = useState('');
  const [childId, setChildId] = useState('');

  const availabilityBlocks = detail?.availabilityBlocks ?? [];

  useEffect(() => {
    setStartsLocal('');
    setEndsLocal('');
    setNote('');
    setChildId('');
  }, [providerProfileId]);

  useEffect(() => {
    if (!viewer.canBook) return;
    const ch = consumerQuery.data?.children;
    if (!ch?.length) return;
    if (ch.length === 1) {
      setChildId(ch[0].id);
    }
  }, [viewer.canBook, consumerQuery.data?.children]);

  const onBookingSlotSelected = useCallback(
    ({ startsAt, endsAt }: { startsAt: string; endsAt: string }) => {
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
      setStartsLocal(toDatetimeLocalValue(start));
      setEndsLocal(toDatetimeLocalValue(end));
    },
    [],
  );

  const applyDurationMins = (mins: number) => {
    if (!startsLocal.trim()) return;
    const nextEnd = addMinutesToDatetimeLocal(startsLocal, mins);
    if (nextEnd) setEndsLocal(nextEnd);
  };

  const slotSummary = useMemo(
    () => formatSlotSummary(startsLocal, endsLocal),
    [startsLocal, endsLocal],
  );

  const createMut = useMutation({
    mutationFn: () => {
      if (!childId.trim()) {
        throw new Error('Elige para qué hijo o hija es la clase.');
      }
      const startsAt = new Date(startsLocal).toISOString();
      const endsAt = new Date(endsLocal).toISOString();
      return createAppointment(getToken, {
        providerProfileId,
        startsAt,
        endsAt,
        childId: childId.trim(),
        noteFromFamily: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', 'me'] });
      router.push('/dashboard/consumer');
    },
  });

  const bookingError =
    createMut.error instanceof ApiError
      ? createMut.error.message
      : createMut.error instanceof Error
        ? createMut.error.message
        : null;

  if (!viewer.isSignedIn) {
    return (
      <div className="rounded-2xl border border-border bg-linear-to-br from-muted/80 to-card p-5 shadow-sm">
        <h3 className="text-sm font-bold text-foreground">Tarifas y reservas</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Inicia sesión para ver las tarifas de este educador, su disponibilidad
          detallada y solicitar una clase.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-border bg-muted/50 p-6">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-4 h-20 rounded-lg bg-muted" />
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        No se pudo cargar tarifas y disponibilidad. Inténtalo de nuevo más tarde.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-foreground">Tarifas</h3>
        {detail.rates.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Este educador aún no ha publicado tarifas.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {detail.rates.map((r) => (
              <li
                key={r.id}
                className="flex justify-between gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm"
              >
                <span className="text-foreground">
                  {r.label?.trim() || 'Servicio'}{' '}
                  <span className="text-muted-foreground">
                    ({unitLabel(r.unit)})
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-foreground">
                  {formatMoney(r.amountMinor, r.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewer.isProviderViewer ? (
        <p className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Como educador, gestionas tus citas desde el panel. Las familias
          reservan desde esta ficha.
        </p>
      ) : null}

      {viewer.canBook ? (
        <div className="rounded-2xl border border-accent/35 bg-linear-to-b from-accent-soft/20 to-card p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-bold text-foreground">Agendar clase</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Elige un hueco dentro del horario publicado por el educador. En{' '}
            <span className="font-semibold text-foreground">Semana</span> o{' '}
            <span className="font-semibold text-foreground">Día</span> verás las
            franjas libres (resaltadas) y podrás arrastrar el intervalo de la
            clase, como en el calendario del iPhone.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            En <span className="font-medium text-foreground">Mes</span> o{' '}
            <span className="font-medium text-foreground">Lista</span> solo
            consultas; para elegir hora, cambia a Semana o Día.
          </p>

          {availabilityBlocks.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              Este educador no tiene franjas futuras publicadas. No es posible
              agendar hasta que añada disponibilidad.
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
                  <span
                    className="h-2.5 w-2.5 rounded-sm bg-accent/40 ring-1 ring-accent/50"
                    aria-hidden
                  />
                  Franjas publicadas
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
                  <span
                    className="h-2.5 w-3 rounded-sm bg-primary/35 ring-1 ring-primary/45"
                    aria-hidden
                  />
                  Tu selección
                </span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-sm sm:p-2">
                <AvailabilityFullCalendar
                  blocks={availabilityBlocks}
                  bookingSelect
                  height={540}
                  initialView="timeGridWeek"
                  onBookingSlotSelected={onBookingSlotSelected}
                />
              </div>
            </>
          )}

          <div className="mt-5 space-y-3">
            {consumerQuery.data && consumerQuery.data.children.length > 0 ? (
              <Field
                label="¿Para quién es la clase?"
                hint="El educador verá este dato en su agenda."
              >
                <Select
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  required
                >
                  <option value="">Selecciona hijo/a…</option>
                  {consumerQuery.data.children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : consumerQuery.isSuccess ? (
              <p className="text-sm text-red-700">
                Añade al menos un hijo o hija en tu perfil para reservar.
              </p>
            ) : null}

            {slotSummary ? (
              <div className="rounded-xl border border-primary/20 bg-muted/60 px-3 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                  Horario elegido
                </p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">
                  {slotSummary}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold text-foreground">
                Duración rápida (desde la hora de inicio)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: '45 min', m: 45 },
                  { label: '1 h', m: 60 },
                  { label: '1 h 30', m: 90 },
                  { label: '2 h', m: 120 },
                ].map(({ label, m }) => (
                  <button
                    key={m}
                    type="button"
                    disabled={!startsLocal.trim()}
                    onClick={() => applyDurationMins(m)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <details className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
              <summary className="cursor-pointer font-semibold text-foreground">
                Ajuste fino (inicio y fin manual)
              </summary>
              <div className="mt-3 space-y-3 pb-1">
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
            </details>

            <Field label="Nota para el educador (opcional)">
              <TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </Field>
            {bookingError ? (
              <p className="text-sm text-red-700">{bookingError}</p>
            ) : null}
            <Button
              type="button"
              variant="primary"
              className="w-full py-3"
              disabled={
                createMut.isPending ||
                !startsLocal ||
                !endsLocal ||
                !childId.trim() ||
                !consumerQuery.data?.children.length ||
                availabilityBlocks.length === 0
              }
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? 'Enviando…' : 'Enviar solicitud de clase'}
            </Button>
          </div>
        </div>
      ) : viewer.isSignedIn && !viewer.isProviderViewer ? (
        <div className="rounded-2xl border border-accent/30 bg-accent-soft/20 p-5 text-sm text-foreground">
          <p className="font-semibold">Completa tu perfil de familia</p>
          <p className="mt-1 text-muted-foreground">
            Para solicitar clases necesitamos datos completos y al menos un
            beneficiario.
          </p>
          <Link
            href="/profile/consumer"
            className="mt-3 inline-block font-semibold text-primary underline"
          >
            Ir a mi perfil
          </Link>
        </div>
      ) : null}
    </div>
  );
}
