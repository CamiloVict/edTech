'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useBootstrapQuery } from '@/features/bootstrap/hooks/use-bootstrap';
import { getPublicEducatorProfile } from '@/features/discover/discover-public-api';
import { EducatorAvailabilityCalendar } from '@/features/educadores/educator-availability-calendar';
import {
  ProviderBookingPanel,
  type ProviderBookingViewer,
  type SlotPrefillRequest,
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

const cardClass =
  'rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8';

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
    const providerReady =
      role === 'PROVIDER' &&
      !boot?.needsRoleSelection &&
      !boot?.needsOnboarding;
    const catalogBackHref = providerReady ? '/dashboard/provider' : '/explorar';
    const catalogBackHomeHref = providerReady
      ? '/dashboard/provider'
      : '/#explorar';
    const catalogBackLabel = providerReady ? 'Mi panel' : 'Educadores';
    return {
      isSignedIn,
      canBook,
      isProviderViewer,
      catalogBackHref,
      catalogBackHomeHref,
      catalogBackLabel,
    };
  }, [userId, bootstrapQuery.data]);
}

export function EducatorProfilePage({
  providerProfileId,
}: {
  providerProfileId: string;
}) {
  const { getToken, userId } = useAuth();
  const viewer = useBookingViewer();
  const bookingRef = useRef<HTMLElement>(null);
  const [slotPrefill, setSlotPrefill] = useState<SlotPrefillRequest | null>(null);

  const clearSlotPrefill = useCallback(() => setSlotPrefill(null), []);

  const pickAvailabilityWindow = useCallback(
    ({ startsAt, endsAt }: { startsAt: string; endsAt: string }) => {
      if (!viewer.canBook) return;
      setSlotPrefill({ id: Date.now(), startsAt, endsAt });
      requestAnimationFrame(() => {
        bookingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    },
    [viewer.canBook],
  );

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
      <div className="min-h-screen bg-background">
        <PublicSiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          Cargando perfil…
        </div>
      </div>
    );
  }

  if (publicQuery.isError) {
    const err = publicQuery.error;
    const is404 = err instanceof ApiError && err.status === 404;
    return (
      <div className="min-h-screen bg-background">
        <PublicSiteHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-foreground">
            {is404 ? 'Educador no encontrado' : 'No se pudo cargar el perfil'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {is404
              ? 'Este perfil no está disponible o ya no está publicado.'
              : 'Comprueba tu conexión o inténtalo más tarde.'}
          </p>
          <Link
            href={viewer.catalogBackHref}
            className="mt-6 inline-block text-sm font-semibold text-primary underline"
          >
            {viewer.catalogBackHref === '/dashboard/provider'
              ? 'Volver a mi panel'
              : 'Volver a educadores'}
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
    <div className="min-h-screen bg-background">
      <PublicSiteHeader />

      <header className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary via-[#132a52] to-primary-hover text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(46,196,182,0.35), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="mb-8 text-sm">
            <Link
              href={viewer.catalogBackHomeHref}
              className="font-medium text-white/85 transition hover:text-white"
            >
              ← {viewer.catalogBackLabel}
            </Link>
          </nav>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-2 ring-white/20 sm:h-52 sm:w-52">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">
                Perfil profesional
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {name}
              </h1>
              {pub.city ? (
                <p className="mt-2 text-lg text-white/90">{pub.city}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {kinds.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
                  >
                    {k}
                  </span>
                ))}
                <span className="rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold text-white ring-1 ring-accent/40">
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
        {/* Dos columnas: contenido + reserva; el calendario va ancho completo debajo */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-8 lg:col-span-7">
            <section className={cardClass}>
              <h2 className="text-lg font-bold text-foreground">Sobre mí</h2>
              {pub.bio ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {pub.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Este educador aún no ha añadido una descripción extendida.
                </p>
              )}
            </section>

            <section className={cardClass}>
              <h2 className="text-lg font-bold text-foreground">
                Trayectoria y enfoque
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Experiencia
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {pub.yearsOfExperience != null
                      ? `${pub.yearsOfExperience} años`
                      : '—'}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Modalidad
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {pub.serviceMode
                      ? modeLabel[pub.serviceMode] ?? pub.serviceMode
                      : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2 rounded-xl bg-muted px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Especialidades
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {pub.focusAreas?.length
                      ? pub.focusAreas.join(' · ')
                      : '—'}
                  </dd>
                </div>
              </dl>
              {pub.availabilitySummary ? (
                <div className="mt-4 rounded-xl border border-accent/25 bg-accent-soft/30 px-4 py-3 text-sm text-foreground">
                  <span className="font-semibold text-primary">
                    Disponibilidad (resumen):{' '}
                  </span>
                  {pub.availabilitySummary}
                </div>
              ) : null}
            </section>

            <section className={cardClass}>
              <h2 className="text-lg font-bold text-foreground">Opiniones</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Valoración mostrada en la plataforma (próximamente reseñas
                verificadas con comentario).
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {rating}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {pub.ratingCount > 0
                  ? `Basado en ${pub.ratingCount} valoración${pub.ratingCount === 1 ? '' : 'es'} registradas.`
                  : 'Aún no hay valoraciones registradas.'}
              </p>
              <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Los comentarios de familias aparecerán aquí cuando activemos
                  reseñas con texto.
                </p>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-lg font-bold text-foreground">
                Comentarios de familias
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Pronto podrás leer experiencias de otras familias que han
                trabajado con este educador. Priorizamos comentarios asociados a
                citas o servicios completados.
              </p>
            </section>
          </div>

          <aside
            ref={bookingRef}
            id="pedir-cita"
            className="scroll-mt-28 lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24">
              <ProviderBookingPanel
                providerProfileId={providerProfileId}
                viewer={viewer}
                detail={detail}
                detailLoading={Boolean(userId && detailQuery.isPending)}
                detailError={detailQuery.isError}
                slotPrefillRequest={slotPrefill}
                onSlotPrefillApplied={clearSlotPrefill}
              />
            </div>
          </aside>
        </div>

        <section
          className={`${cardClass} mt-12 scroll-mt-24 lg:mt-16`}
          aria-labelledby="availability-heading"
        >
          <div className="border-b border-border pb-4 sm:flex sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2
                id="availability-heading"
                className="text-lg font-bold text-foreground"
              >
                Disponibilidad publicada
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Calendario a ancho completo: revisa qué días y franjas tiene
                abiertas para solicitar una clase (sujeto a confirmación).
              </p>
            </div>
          </div>

          <div className="mt-6">
            {!userId ? (
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                <p>
                  Inicia sesión para ver el calendario con las fechas publicadas
                  por este educador.
                </p>
                {pub.availabilitySummary ? (
                  <p className="mt-3 text-xs">
                    <span className="font-semibold text-foreground">
                      Resumen público:{' '}
                    </span>
                    {pub.availabilitySummary}
                  </p>
                ) : null}
              </div>
            ) : detailQuery.isLoading ? (
              <div className="h-56 animate-pulse rounded-xl bg-muted" />
            ) : detail?.availabilityBlocks?.length ? (
              <EducatorAvailabilityCalendar
                blocks={detail.availabilityBlocks}
                onSelectWindow={
                  viewer.canBook ? pickAvailabilityWindow : undefined
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay ventanas futuras publicadas. Vuelve más tarde o revisa
                el resumen en la ficha.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
