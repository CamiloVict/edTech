'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo } from 'react';

import {
  listMyAppointments,
  patchAppointment,
  type AppointmentRow,
} from '@/features/appointments/api/appointments-api';
import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import { ConsumerFamilyForm } from '@/features/consumer/components/consumer-family-form';
import {
  consumerHubHref,
  parseConsumerHubSection,
  type ConsumerHubSection,
} from '@/features/consumer/lib/consumer-hub';
import { getConsumerProfile } from '@/features/consumer/api/consumer-api';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { AppHeader } from '@/shared/components/app-header';
import { Button } from '@/shared/components/ui/button';

const terminalStatuses = new Set([
  'DECLINED',
  'CANCELLED_BY_FAMILY',
  'CANCELLED_BY_PROVIDER',
]);

function statusConsumerLabel(s: AppointmentRow['status']) {
  const map: Record<AppointmentRow['status'], string> = {
    PENDING: 'Pendiente de confirmación',
    CONFIRMED: 'Confirmada',
    DECLINED: 'Rechazada',
    CANCELLED_BY_FAMILY: 'Cancelada por ti',
    CANCELLED_BY_PROVIDER: 'Cancelada por el educador',
  };
  return map[s];
}

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

function formatMemberSince(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

const SECTION_LABELS: Record<ConsumerHubSection, string> = {
  resumen: 'Resumen',
  familia: 'Familia y datos',
  citas: 'Citas',
};

function ConsumerHubContent() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const seccion = parseConsumerHubSection(searchParams.get('seccion'));

  const setSeccion = useCallback(
    (next: ConsumerHubSection) => {
      const href = consumerHubHref(next);
      router.replace(href, { scroll: false });
    },
    [router],
  );

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['consumer-profile'],
    queryFn: () => getConsumerProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'CONSUMER',
  });

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: () => listMyAppointments(getToken),
    enabled: bootstrapQuery.data?.user.role === 'CONSUMER',
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) =>
      patchAppointment(getToken, id, { status: 'CANCELLED_BY_FAMILY' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', 'me'] });
    },
  });

  useEffect(() => {
    const b = bootstrapQuery.data;
    if (!b) return;
    const next = pathAfterBootstrap(b);
    if (next !== '/dashboard/consumer') {
      router.replace(next);
    }
  }, [bootstrapQuery.data, router]);

  const displayName = useMemo(() => {
    const p = profileQuery.data;
    return (
      p?.fullName ||
      user?.firstName ||
      user?.primaryEmailAddress?.emailAddress ||
      'familia'
    );
  }, [profileQuery.data, user]);

  if (
    bootstrapQuery.isLoading ||
    profileQuery.isLoading ||
    appointmentsQuery.isLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-base text-muted-foreground">
        Cargando tu espacio…
      </div>
    );
  }

  if (
    bootstrapQuery.isError ||
    profileQuery.isError ||
    appointmentsQuery.isError ||
    !profileQuery.data
  ) {
    return (
      <div className="p-8 text-base text-red-700">
        No se pudo cargar tu tablero.{' '}
        <Link href="/mi-espacio" className="font-semibold underline">
          Reintentar
        </Link>
      </div>
    );
  }

  const profile = profileQuery.data;
  const bUser = bootstrapQuery.data?.user;
  const email =
    user?.primaryEmailAddress?.emailAddress ?? bUser?.email ?? '—';

  const now = new Date();
  const allAppts = appointmentsQuery.data ?? [];
  const upcoming = allAppts.filter(
    (a) =>
      !terminalStatuses.has(a.status) && new Date(a.endsAt) >= now,
  );
  const history = allAppts.filter(
    (a) => terminalStatuses.has(a.status) || new Date(a.endsAt) < now,
  );

  const hubLinks = [
    { href: consumerHubHref('resumen'), label: 'Mi espacio', emphasized: true },
    { href: '/planner', label: 'Planner educativo' },
    { href: '/explorar', label: 'Educadores' },
    { href: consumerHubHref('familia'), label: 'Familia y datos' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader logoHref="/explorar" pageLabel="Familia" links={hubLinks} />
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <nav
          className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
          aria-label="Secciones del espacio familiar"
        >
          {(Object.keys(SECTION_LABELS) as ConsumerHubSection[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSeccion(key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                seccion === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </nav>

        {seccion === 'resumen' ? (
          <>
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                  Hola, {displayName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Un solo lugar para tu familia, datos y citas.
                </p>
              </div>
              <Button
                type="button"
                className="shrink-0"
                onClick={() => setSeccion('familia')}
              >
                Editar datos de la familia
              </Button>
            </header>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-primary">
                Tu espacio en un vistazo
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{email}</span>
                {profile.city ? (
                  <>
                    {' '}
                    · {profile.city}
                  </>
                ) : null}
                {profile.phone ? (
                  <>
                    {' '}
                    · {profile.phone}
                  </>
                ) : null}
                {bUser?.createdAt ? (
                  <>
                    {' '}
                    · En la plataforma desde {formatMemberSince(bUser.createdAt)}
                  </>
                ) : null}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.children.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Aún no hay niños registrados.
                  </span>
                ) : (
                  profile.children.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground"
                    >
                      {c.firstName} · {c.birthDate.slice(0, 10)}
                    </span>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => setSeccion('familia')}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Editar familia
                </button>
              </div>
              <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-foreground">
                <span className="font-semibold text-primary">
                  Educational Planner:
                </span>{' '}
                roadmap por edad y categoría, con fundamento pedagógico y edición
                local.{' '}
                <Link
                  href="/planner"
                  className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  Abrir planner
                </Link>
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-bold text-primary">
                  Próximas citas
                </h2>
                <button
                  type="button"
                  onClick={() => setSeccion('citas')}
                  className="text-left text-sm font-semibold text-primary underline underline-offset-2 sm:text-right"
                >
                  Ver todas las citas
                </button>
              </div>
              {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No tienes citas activas. Explora educadores y solicita una
                  dentro de sus ventanas publicadas.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {upcoming.slice(0, 3).map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-accent">
                            Para {a.child?.firstName ?? '—'}
                          </p>
                          <p className="font-semibold text-foreground">
                            {a.providerProfile.fullName?.trim() || 'Educador'}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {formatApptRange(a.startsAt, a.endsAt)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {statusConsumerLabel(a.status)}
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
              <Link
                href="/explorar"
                className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-2"
              >
                Buscar educadores
              </Link>
            </section>

            <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 sm:p-6">
              <h2 className="text-base font-bold text-primary">
                Notas del docente
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Próximamente verás aquí comentarios y seguimiento por hijo o por
                servicio contratado.
              </p>
            </section>
          </>
        ) : null}

        {seccion === 'familia' ? (
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="-ml-2 text-sm text-muted-foreground"
              onClick={() => setSeccion('resumen')}
            >
              ← Volver al resumen
            </Button>
            <ConsumerFamilyForm />
          </div>
        ) : null}

        {seccion === 'citas' ? (
          <div className="space-y-5">
            <Button
              type="button"
              variant="ghost"
              className="-ml-2 text-sm text-muted-foreground"
              onClick={() => setSeccion('resumen')}
            >
              ← Volver al resumen
            </Button>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-bold text-primary">
                  Próximas citas
                </h2>
                <Link
                  href="/explorar"
                  className="text-sm font-semibold text-primary underline underline-offset-2"
                >
                  Buscar educadores
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No tienes citas activas. Explora educadores y solicita una
                  dentro de sus ventanas publicadas.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {upcoming.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-accent">
                            Para {a.child?.firstName ?? '—'}
                          </p>
                          <p className="font-semibold text-foreground">
                            {a.providerProfile.fullName?.trim() || 'Educador'}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {formatApptRange(a.startsAt, a.endsAt)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {statusConsumerLabel(a.status)}
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

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-primary">
                Historial de citas
              </h2>
              {history.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Aquí aparecerán citas pasadas o cerradas.
                </p>
              ) : (
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm text-muted-foreground">
                  {history.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap justify-between gap-2 border-b border-border py-2 last:border-0"
                    >
                      <span className="font-medium text-foreground">
                        <span className="text-accent">
                          {a.child?.firstName ?? '—'}
                        </span>
                        {' · '}
                        {a.providerProfile.fullName?.trim() || 'Educador'}
                      </span>
                      <span className="text-xs">
                        {formatApptRange(a.startsAt, a.endsAt)} ·{' '}
                        {statusConsumerLabel(a.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function ConsumerHubFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8 text-muted-foreground">
      Cargando…
    </div>
  );
}

export default function ConsumerDashboardPage() {
  return (
    <Suspense fallback={<ConsumerHubFallback />}>
      <ConsumerHubContent />
    </Suspense>
  );
}
