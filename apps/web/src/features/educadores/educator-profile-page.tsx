'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useBootstrapQuery } from '@/features/bootstrap/hooks/use-bootstrap';
import { getPublicEducatorProfile } from '@/features/discover/discover-public-api';
import { EducatorAvailabilityCalendar } from '@/features/educadores/educator-availability-calendar';
import {
  ProviderBookingPanel,
  type ProviderBookingViewer,
} from '@/features/educadores/provider-booking-panel';
import { getProviderDetail } from '@/features/providers/api/providers-api';
import { PublicSiteHeader } from '@/shared/components/public-site-header';
import { ApiError } from '@/shared/lib/api';

const kindLabel: Record<string, string> = {
  TEACHER: 'Profesor particular',
  BABYSITTER: 'Cuidador/a infantil',
};

const modeLabel: Record<string, string> = {
  IN_PERSON: 'Presencial',
  ONLINE: 'En línea',
  HYBRID: 'Híbrido',
};

function useBookingViewer() {
  const { userId, isLoaded } = useAuth();
  const bootstrapQuery = useBootstrapQuery({
    enabled: Boolean(isLoaded && userId),
  });

  return useMemo((): ProviderBookingViewer => {
    const boot = bootstrapQuery.data;
    const isSignedIn = Boolean(userId);
    const role = boot?.user.role ?? null;
    const consumerComplete =
      boot?.consumerProfile?.isProfileCompleted === true;
    const canBook = role === 'CONSUMER' && consumerComplete;
    const isProviderViewer = role === 'PROVIDER';
    return { isSignedIn, canBook, isProviderViewer };
  }, [userId, bootstrapQuery.data]);
}

export function EducatorProfilePage({
  providerProfileId,
}: {
  providerProfileId: string;
}) {
  const { getToken, userId } = useAuth();
  const viewer = useBookingViewer();

  const publicQuery = useQuery({
    queryKey: ['educador-public', providerProfileId],
    queryFn: () => getPublicEducatorProfile(providerProfileId),
    retry: false,
  });

  const detailQuery = useQuery({
    queryKey: ['provider-detail', providerProfileId],
    queryFn: () => getProviderDetail(getToken, providerProfileId),
    enabled: Boolean(userId && providerProfileId),
  });

  if (publicQuery.isPending) {
    return (
      <div className="min-h-screen bg-stone-100">
        <PublicSiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-stone-500">
          Cargando perfil…
        </div>
      </div>
    );
  }

  if (publicQuery.isError) {
    const err = publicQuery.error;
    const is404 = err instanceof ApiError && err.status === 404;
    return (
      <div className="min-h-screen bg-stone-100">
        <PublicSiteHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-stone-900">
            {is404 ? 'Educador no encontrado' : 'No se pudo cargar el perfil'}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {is404
              ? 'Este perfil no está disponible o ya no está publicado.'
              : 'Comprueba tu conexión o inténtalo más tarde.'}
          </p>
          <Link
            href="/explorar"
            className="mt-6 inline-block text-sm font-semibold text-emerald-900 underline"
          >
            Volver a educadores
          </Link>
        </div>
      </div>
    );
  }

  const pub = publicQuery.data;
  const name = pub.fullName?.trim() || 'Educador';
  const kinds = pub.kinds.map((k) => kindLabel[k] ?? k);
  const rating =
    typeof pub.averageRating === 'number' && !Number.isNaN(pub.averageRating)
      ? pub.averageRating.toFixed(1)
      : '—';
  const detail = detailQuery.data;

  return (
    <div className="min-h-screen bg-stone-100">
      <PublicSiteHeader />

      <header className="relative overflow-hidden border-b border-stone-800/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.18), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="mb-8 text-sm">
            <Link
              href="/#explorar"
              className="font-medium text-emerald-200/90 transition hover:text-white"
            >
              ← Educadores
            </Link>
          </nav>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-4 ring-white/15 sm:h-52 sm:w-52">
              {pub.photoUrl ? (
                <Image
                  src={pub.photoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="208px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-bold text-white/35">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="max-w-2xl flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">
                Perfil profesional
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {name}
              </h1>
              {pub.city ? (
                <p className="mt-2 text-lg text-emerald-100/90">{pub.city}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {kinds.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
                  >
                    {k}
                  </span>
                ))}
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100">
                  ★ {rating}
                  {pub.ratingCount > 0
                    ? ` · ${pub.ratingCount} valoraciones`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start">
          <div className="space-y-10">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-stone-900">Sobre mí</h2>
              {pub.bio ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-600 sm:text-base">
                  {pub.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-stone-500">
                  Este educador aún no ha añadido una descripción extendida.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-stone-900">
                Trayectoria y enfoque
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Experiencia
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-stone-900">
                    {pub.yearsOfExperience != null
                      ? `${pub.yearsOfExperience} años`
                      : '—'}
                  </dd>
                </div>
                <div className="rounded-xl bg-stone-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Modalidad
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-stone-900">
                    {pub.serviceMode
                      ? modeLabel[pub.serviceMode] ?? pub.serviceMode
                      : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2 rounded-xl bg-stone-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Especialidades
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-stone-900">
                    {pub.focusAreas?.length
                      ? pub.focusAreas.join(' · ')
                      : '—'}
                  </dd>
                </div>
              </dl>
              {pub.availabilitySummary ? (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-950">
                  <span className="font-semibold">Disponibilidad (resumen): </span>
                  {pub.availabilitySummary}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-stone-900">Opiniones</h2>
              <p className="mt-1 text-sm text-stone-500">
                Valoración mostrada en la plataforma (próximamente reseñas
                verificadas con comentario).
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-stone-900">
                  {rating}
                </span>
                <span className="text-sm text-stone-500">/ 5</span>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {pub.ratingCount > 0
                  ? `Basado en ${pub.ratingCount} valoración${pub.ratingCount === 1 ? '' : 'es'} registradas.`
                  : 'Aún no hay valoraciones registradas.'}
              </p>
              <div className="mt-8 rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center">
                <p className="text-sm font-medium text-stone-600">
                  Los comentarios de familias aparecerán aquí cuando activemos
                  reseñas con texto.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-stone-900">
                Comentarios de familias
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Pronto podrás leer experiencias de otras familias que han
                trabajado con este educador. Priorizamos comentarios asociados a
                citas o servicios completados.
              </p>
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-bold text-stone-900">
                Calendario de disponibilidad
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Ventanas en las que puedes solicitar una cita (sujetas a
                confirmación).
              </p>
              {!userId ? (
                <div className="mt-4 rounded-xl bg-stone-50 px-4 py-5 text-sm text-stone-600">
                  <p>
                    Inicia sesión para ver el calendario interactivo con las
                    fechas publicadas por este educador.
                  </p>
                  {pub.availabilitySummary ? (
                    <p className="mt-3 text-xs text-stone-500">
                      Resumen público: {pub.availabilitySummary}
                    </p>
                  ) : null}
                </div>
              ) : detailQuery.isLoading ? (
                <div className="mt-4 h-48 animate-pulse rounded-xl bg-stone-100" />
              ) : detail?.availabilityBlocks?.length ? (
                <div className="mt-4">
                  <EducatorAvailabilityCalendar
                    blocks={detail.availabilityBlocks}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-stone-500">
                  No hay ventanas futuras publicadas. Vuelve más tarde o revisa
                  el resumen arriba.
                </p>
              )}
            </div>

            <ProviderBookingPanel
              providerProfileId={providerProfileId}
              viewer={viewer}
              detail={detail}
              detailLoading={Boolean(userId && detailQuery.isPending)}
              detailError={detailQuery.isError}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
