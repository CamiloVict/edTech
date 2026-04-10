'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchBootstrap } from '@/features/bootstrap/api/bootstrap-api';
import { getConsumerProfile } from '@/features/consumer/api/consumer-api';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { AppHeader } from '@/shared/components/app-header';

export default function ConsumerDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: ['bootstrap'],
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['consumer-profile'],
    queryFn: () => getConsumerProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'CONSUMER',
  });

  useEffect(() => {
    const b = bootstrapQuery.data;
    if (!b) return;
    const next = pathAfterBootstrap(b);
    if (next !== '/dashboard/consumer') {
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
    'familia';

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader
        title="TrofoSchool"
        links={[
          { href: '/dashboard/consumer', label: 'Inicio' },
          { href: '/profile/consumer', label: 'Mi perfil' },
        ]}
      />
      <main className="mx-auto max-w-3xl space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {name}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Resumen de tu perfil familiar y beneficiarios.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Tu perfil
          </h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Ciudad</dt>
              <dd>{profile.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Teléfono</dt>
              <dd>{profile.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Relación</dt>
              <dd>{profile.relationshipToChild ?? '—'}</dd>
            </div>
          </dl>
          <Link
            href="/profile/consumer"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Editar perfil
          </Link>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Niños
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {profile.children.length === 0 && (
              <li className="text-zinc-500">Aún no hay niños registrados.</li>
            )}
            {profile.children.map((c) => (
              <li
                key={c.id}
                className="flex flex-col rounded-lg border border-zinc-100 px-3 py-2"
              >
                <span className="font-medium">{c.firstName}</span>
                <span className="text-zinc-500">
                  Nacido/a el {c.birthDate.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
