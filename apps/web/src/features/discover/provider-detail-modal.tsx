'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { createAppointment } from '@/features/appointments/api/appointments-api';
import { getConsumerProfile } from '@/features/consumer/api/consumer-api';
import {
  getProviderDetail,
  type ProviderDetailResponse,
} from '@/features/providers/api/providers-api';
import { ApiError } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Field, Input, Select, TextArea } from '@/shared/components/ui/field';

import type { DiscoverProvider } from './provider-discovery';

const kindLabel: Record<string, string> = {
  TEACHER: 'Profesor',
  BABYSITTER: 'Cuidador/a',
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

function formatRange(isoStart: string, isoEnd: string) {
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

export type ProviderDetailViewer = {
  isSignedIn: boolean;
  canBook: boolean;
  isProviderViewer: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  summary: DiscoverProvider | null;
  viewer: ProviderDetailViewer;
};

export function ProviderDetailModal({ open, onClose, summary, viewer }: Props) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const id = summary?.id ?? '';

  const detailQuery = useQuery({
    queryKey: ['provider-detail', id],
    queryFn: () => getProviderDetail(getToken, id),
    enabled: open && viewer.isSignedIn && Boolean(id),
  });

  const consumerQuery = useQuery({
    queryKey: ['consumer-profile'],
    queryFn: () => getConsumerProfile(getToken),
    enabled: open && viewer.canBook,
  });

  const [startsLocal, setStartsLocal] = useState('');
  const [endsLocal, setEndsLocal] = useState('');
  const [note, setNote] = useState('');
  const [childId, setChildId] = useState('');

  useEffect(() => {
    if (!open) return;
    setStartsLocal('');
    setEndsLocal('');
    setNote('');
    setChildId('');
  }, [open, id]);

  useEffect(() => {
    if (!open || !viewer.canBook) return;
    const ch = consumerQuery.data?.children;
    if (!ch?.length) return;
    if (ch.length === 1) {
      setChildId(ch[0].id);
    }
  }, [open, viewer.canBook, consumerQuery.data?.children]);

  const createMut = useMutation({
    mutationFn: () => {
      if (!summary) throw new Error('missing');
      if (!childId.trim()) {
        throw new Error('Elige para qué hijo o hija es la cita.');
      }
      const startsAt = new Date(startsLocal).toISOString();
      const endsAt = new Date(endsLocal).toISOString();
      return createAppointment(getToken, {
        providerProfileId: summary.id,
        startsAt,
        endsAt,
        childId: childId.trim(),
        noteFromFamily: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', 'me'] });
      onClose();
    },
  });

  const bookingError =
    createMut.error instanceof ApiError
      ? createMut.error.message
      : createMut.error instanceof Error
        ? createMut.error.message
        : null;

  if (!open || !summary) {
    return null;
  }

  const detail: ProviderDetailResponse | null = detailQuery.data ?? null;

  const title = detail?.fullName?.trim() || summary.displayName || 'Educador';
  const photo = detail?.photoUrl ?? summary.photoUrl ?? null;
  const bio = detail?.bio ?? summary.bio ?? null;
  const city = detail?.city ?? summary.headline ?? null;
  const kinds = (detail?.kinds ?? summary.kinds ?? []).map((k) => kindLabel[k] ?? k);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-detail-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-stone-200 bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 sm:px-5">
          <h2
            id="provider-detail-title"
            className="text-lg font-bold text-stone-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative mx-auto h-36 w-full max-w-xs overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-stone-100">
            {photo ? (
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-semibold text-emerald-800/40">
                {title.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {city ? (
            <p className="text-center text-sm text-stone-600">{city}</p>
          ) : null}
          {kinds.length ? (
            <p className="text-center text-xs text-stone-500">{kinds.join(' · ')}</p>
          ) : null}
          {bio ? (
            <p className="text-sm leading-relaxed text-stone-600">{bio}</p>
          ) : null}

          {!viewer.isSignedIn ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-4 text-sm text-amber-950">
              <p className="font-medium">Tarifas y citas con sesión</p>
              <p className="mt-1 text-amber-900/90">
                Inicia sesión para ver las tarifas de este educador y solicitar una
                cita.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-emerald-900 underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          ) : detailQuery.isLoading ? (
            <p className="text-sm text-stone-500">Cargando tarifas y disponibilidad…</p>
          ) : detailQuery.isError ? (
            <p className="text-sm text-red-700">
              No se pudo cargar la ficha. Inténtalo de nuevo más tarde.
            </p>
          ) : detail ? (
            <>
              <section>
                <h3 className="text-sm font-bold text-stone-900">Tarifas</h3>
                {detail.rates.length === 0 ? (
                  <p className="mt-1 text-sm text-stone-500">
                    Este educador aún no ha publicado tarifas.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.rates.map((r) => (
                      <li
                        key={r.id}
                        className="flex justify-between gap-3 rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2 text-sm"
                      >
                        <span className="text-stone-700">
                          {r.label?.trim() || 'Servicio'}{' '}
                          <span className="text-stone-500">
                            ({unitLabel(r.unit)})
                          </span>
                        </span>
                        <span className="shrink-0 font-semibold text-stone-900">
                          {formatMoney(r.amountMinor, r.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {detail.availabilitySummary ? (
                <p className="text-sm text-stone-600">
                  <span className="font-medium text-stone-800">
                    Disponibilidad (resumen):{' '}
                  </span>
                  {detail.availabilitySummary}
                </p>
              ) : null}

              <section>
                <h3 className="text-sm font-bold text-stone-900">
                  Ventanas publicadas
                </h3>
                {detail.availabilityBlocks.length === 0 ? (
                  <p className="mt-1 text-sm text-stone-500">
                    No hay huecos publicados aún. Vuelve más tarde.
                  </p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-stone-600">
                    {detail.availabilityBlocks.map((b) => (
                      <li
                        key={b.id}
                        className="rounded border border-stone-100 px-2 py-1"
                      >
                        {formatRange(b.startsAt, b.endsAt)}
                        {b.isAllDay ? (
                          <span className="ml-1 text-xs text-stone-400">
                            (día completo · {b.timezone})
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {viewer.isProviderViewer ? (
                <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
                  Como educador, gestionas las citas desde tu panel. Las familias
                  solicitan aquí; tú confirmas o declinas.
                </p>
              ) : null}

              {viewer.canBook ? (
                <section className="border-t border-stone-100 pt-4">
                  <h3 className="text-sm font-bold text-stone-900">
                    Solicitar cita
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Indica para qué hijo o hija es el servicio; si tienes varios,
                    cada uno puede tener sus propias citas y horarios. El horario
                    debe caer dentro de una ventana listada arriba.
                  </p>
                  <div className="mt-3 space-y-3">
                    {consumerQuery.data &&
                    consumerQuery.data.children.length > 0 ? (
                      <Field
                        label="¿Para quién es la cita?"
                        hint="Obligatorio. El educador verá este dato en su calendario."
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
                        No hay hijos en tu perfil. Añade al menos uno para poder
                        reservar.
                      </p>
                    ) : null}
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
                      disabled={
                        createMut.isPending ||
                        !startsLocal ||
                        !endsLocal ||
                        !childId.trim() ||
                        !consumerQuery.data?.children.length
                      }
                      onClick={() => createMut.mutate()}
                    >
                      {createMut.isPending ? 'Enviando…' : 'Enviar solicitud'}
                    </Button>
                  </div>
                </section>
              ) : viewer.isSignedIn && !viewer.isProviderViewer ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-950">
                  <p className="font-medium">Completa tu perfil de familia</p>
                  <p className="mt-1 text-emerald-900/90">
                    Para solicitar citas necesitamos tu perfil completo (datos y
                    al menos un hijo o hija).
                  </p>
                  <Link
                    href="/profile/consumer"
                    className="mt-2 inline-block font-semibold text-emerald-900 underline"
                  >
                    Ir a mi perfil
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
