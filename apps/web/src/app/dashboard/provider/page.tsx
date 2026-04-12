'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import { getProviderProfile } from '@/features/provider/api/provider-api';
import { ProviderSchedulingSection } from '@/features/scheduling/components/provider-scheduling-section';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { AppHeader } from '@/shared/components/app-header';

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

const modeLabel: Record<string, string> = {
  IN_PERSON: 'Presencial',
  ONLINE: 'En línea',
  HYBRID: 'Combinado',
};

export default function ProviderDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getProviderProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'PROVIDER',
  });

  useEffect(() => {
    const b = bootstrapQuery.data;
    if (!b) return;
    const next = pathAfterBootstrap(b);
    if (next !== '/dashboard/provider') {
      router.replace(next);
    }
  }, [bootstrapQuery.data, router]);

  const displayName = useMemo(() => {
    const p = profileQuery.data;
    return (
      p?.fullName ||
      user?.firstName ||
      user?.primaryEmailAddress?.emailAddress ||
      'educador/a'
    );
  }, [profileQuery.data, user]);

  if (bootstrapQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-8 text-base text-stone-600">
        Cargando tu espacio…
      </div>
    );
  }

  if (bootstrapQuery.isError || profileQuery.isError || !profileQuery.data) {
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

  return (
    <div className="min-h-screen bg-stone-50">
      <AppHeader
        pageLabel="Educador"
        links={[
          { href: '/dashboard/provider', label: 'Mi panel', emphasized: true },
          { href: '/explorar', label: 'Educadores' },
          { href: '/profile/provider', label: 'Mi perfil' },
        ]}
      />
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
              Hola, {displayName}
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Educador · vista previa pública y tu cuenta
            </p>
          </div>
          <Link
            href="/profile/provider"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
          >
            Editar perfil y preferencias
          </Link>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-8">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:h-32 sm:w-32">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                  Sin foto
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900">
                {profile.averageRating.toFixed(1)} ★ · {profile.ratingCount}{' '}
                valoraciones ·{' '}
                {profile.isAvailable ? 'Listado público' : 'No listado'}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {profile.kinds.includes('TEACHER') && 'Educación '}
                {profile.kinds.includes('TEACHER') &&
                  profile.kinds.includes('BABYSITTER') &&
                  '· '}
                {profile.kinds.includes('BABYSITTER') && 'Cuidado'}
              </p>
              {profile.availabilitySummary ? (
                <p className="mt-2 line-clamp-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
                  {profile.availabilitySummary}
                </p>
              ) : null}
              <p className="mt-3 line-clamp-3 text-sm leading-snug text-stone-700">
                {profile.bio ?? 'Sin descripción aún.'}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2 sm:text-base">
            <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <dt className="text-stone-500">Correo</dt>
              <dd className="truncate text-right font-medium">{email}</dd>
            </div>
            {bUser?.createdAt ? (
              <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
                <dt className="text-stone-500">Desde</dt>
                <dd className="text-right">
                  {formatMemberSince(bUser.createdAt)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <dt className="text-stone-500">Experiencia</dt>
              <dd className="font-medium">{profile.yearsOfExperience ?? '—'} a.</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <dt className="text-stone-500">Modalidad</dt>
              <dd className="text-right font-medium">
                {profile.serviceMode
                  ? (modeLabel[profile.serviceMode] ?? profile.serviceMode)
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <dt className="text-stone-500">Ciudad</dt>
              <dd className="font-medium">{profile.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 sm:col-span-2">
              <dt className="shrink-0 text-stone-500">Enfoque</dt>
              <dd className="text-right text-sm font-medium leading-snug">
                {profile.focusAreas.length
                  ? profile.focusAreas.join(', ')
                  : '—'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 border-t border-violet-200/80 bg-violet-50/90 px-3 py-2 text-sm leading-snug text-violet-950">
            <span className="font-semibold">Planes para profesionales:</span>{' '}
            próximamente. Todo lo público se edita con el botón de arriba.
          </p>
        </section>

        <ProviderSchedulingSection />
      </main>
    </div>
  );
}
