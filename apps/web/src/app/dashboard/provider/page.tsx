'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchBootstrap } from '@/features/bootstrap/api/bootstrap-api';
import { getProviderProfile } from '@/features/provider/api/provider-api';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { AppHeader } from '@/shared/components/app-header';

export default function ProviderDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: ['bootstrap'],
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

  if (bootstrapQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="p-8 text-center text-sm text-zinc-600">Cargando…</div>
    );
  }

  if (bootstrapQuery.isError || profileQuery.isError || !profileQuery.data) {
    return (
      <div className="p-8 text-sm text-red-600">
        No se pudo cargar el tablero.{' '}
        <Link href="/bootstrap" className="underline">
          Reintentar
        </Link>
      </div>
    );
  }

  const profile = profileQuery.data;
  const name =
    profile.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    'educador/a';

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader
        title="TrofoSchool"
        links={[
          { href: '/dashboard/provider', label: 'Inicio' },
          { href: '/profile/provider', label: 'Mi perfil' },
        ]}
      />
      <main className="mx-auto max-w-3xl space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {name}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Así te ven las familias en esta primera versión.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Perfil profesional
          </h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  Sin foto
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-800">
                {profile.averageRating.toFixed(1)} ★ · {profile.ratingCount}{' '}
                valoraciones ·{' '}
                {profile.isAvailable ? 'Visible en inicio' : 'No listado'}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                {profile.kinds.includes('TEACHER') && 'Docente '}
                {profile.kinds.includes('TEACHER') &&
                  profile.kinds.includes('BABYSITTER') &&
                  '· '}
                {profile.kinds.includes('BABYSITTER') && 'Babysitter '}
              </p>
              {profile.availabilitySummary && (
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {profile.availabilitySummary}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-700">{profile.bio ?? '—'}</p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Experiencia (años)</dt>
              <dd>{profile.yearsOfExperience ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Modalidad</dt>
              <dd>{profile.serviceMode ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Ciudad</dt>
              <dd>{profile.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Enfoque</dt>
              <dd>{profile.focusAreas.length ? profile.focusAreas.join(', ') : '—'}</dd>
            </div>
          </dl>
          <Link
            href="/profile/provider"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Editar perfil
          </Link>
        </section>
      </main>
    </div>
  );
}
