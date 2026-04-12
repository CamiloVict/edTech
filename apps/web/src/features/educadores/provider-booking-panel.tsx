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
      <div className="rounded-2xl border border-amber-100/90 bg-linear-to-br from-amber-50 to-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900">Tarifas y reservas</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Inicia sesión para ver las tarifas de este educador, su disponibilidad
          detallada y solicitar una clase.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-stone-200 bg-stone-50 p-6">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="mt-4 h-20 rounded-lg bg-stone-200/80" />
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
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-stone-900">Tarifas</h3>
        {detail.rates.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Este educador aún no ha publicado tarifas.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {detail.rates.map((r) => (
              <li
                key={r.id}
                className="flex justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 text-sm"
              >
                <span className="text-stone-700">
                  {r.label?.trim() || 'Servicio'}{' '}
                  <span className="text-stone-500">({unitLabel(r.unit)})</span>
                </span>
                <span className="shrink-0 font-semibold text-stone-900">
                  {formatMoney(r.amountMinor, r.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewer.isProviderViewer ? (
        <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Como educador, gestionas tus citas desde el panel. Las familias
          reservan desde esta ficha.
        </p>
      ) : null}

      {viewer.canBook ? (
        <div className="rounded-2xl border border-emerald-200/60 bg-linear-to-b from-emerald-50/50 to-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-bold text-stone-900">Agendar clase</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Elige un hueco dentro del horario publicado por el educador. En{' '}
            <span className="font-semibold">Semana</span> o{' '}
            <span className="font-semibold">Día</span> verás las horas libres
            (banda verde) y podrás arrastrar el intervalo de la clase, como en
            el calendario del iPhone.
          </p>
          <p className="mt-2 text-xs text-stone-500">
            En <span className="font-medium">Mes</span> o{' '}
            <span className="font-medium">Lista</span> solo consultas; para
            elegir hora, cambia a Semana o Día.
          </p>

          {availabilityBlocks.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              Este educador no tiene franjas futuras publicadas. No es posible
              agendar hasta que añada disponibilidad.
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-stone-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
                  <span
                    className="h-2.5 w-2.5 rounded-sm bg-emerald-500/35 ring-1 ring-emerald-600/30"
                    aria-hidden
                  />
                  Horas en las que acepta clases
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
                  <span
                    className="h-2.5 w-3 rounded-sm bg-emerald-600/35 ring-1 ring-emerald-700/40"
                    aria-hidden
                  />
                  Tu selección
                </span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-sm sm:p-2">
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
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                  Horario elegido
                </p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-stone-900">
                  {slotSummary}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold text-stone-700">
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
                    className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <details className="rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2 text-sm">
              <summary className="cursor-pointer font-semibold text-stone-800">
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
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-emerald-950">
          <p className="font-semibold">Completa tu perfil de familia</p>
          <p className="mt-1 text-emerald-900/90">
            Para solicitar clases necesitamos datos completos y al menos un
            beneficiario.
          </p>
          <Link
            href="/profile/consumer"
            className="mt-3 inline-block font-semibold text-emerald-900 underline"
          >
            Ir a mi perfil
          </Link>
        </div>
      ) : null}
    </div>
  );
}
