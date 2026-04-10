import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

import { ProviderDiscovery } from '@/features/discover/ui/provider-discovery';
import type { ProviderKind } from '@/features/discover/types';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { userId } = await auth();
  const sp = await searchParams;
  const raw = sp.kind;
  const activeKind: '' | ProviderKind =
    raw === 'TEACHER' || raw === 'BABYSITTER' ? raw : '';

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold text-zinc-900">
            TrofoSchool
          </span>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {userId ? (
              <Link
                href="/bootstrap"
                className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800"
              >
                Mi cuenta
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            El primer colegio sin profesores tradicionales
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Familias y educadores en un mismo lugar. Descubre quién puede
            acompañar a tu familia hoy.
          </p>
        </div>

        <ProviderDiscovery activeKind={activeKind} />
      </main>
    </div>
  );
}
