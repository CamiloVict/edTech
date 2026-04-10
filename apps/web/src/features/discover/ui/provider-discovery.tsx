import Link from 'next/link';

import { fetchDiscoverProviders } from '@/features/discover/lib/fetch-discover';
import type { ProviderKind } from '@/features/discover/types';

import { ProviderCard } from './provider-card';

function filterLink(
  label: string,
  kind: '' | ProviderKind,
  active: '' | ProviderKind,
) {
  const href = kind ? `/?kind=${kind}` : '/';
  const isActive = active === kind;
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        isActive
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50'
      }`}
    >
      {label}
    </Link>
  );
}

export async function ProviderDiscovery({
  activeKind,
}: {
  activeKind: '' | ProviderKind;
}) {
  const providers = await fetchDiscoverProviders(activeKind);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Educadores y cuidadores disponibles
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Explora perfiles con bio, valoraciones y disponibilidad general. Los
            horarios detallados y reservas llegarán en una siguiente etapa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterLink('Todos', '', activeKind)}
          {filterLink('Docentes', 'TEACHER', activeKind)}
          {filterLink('Babysitters', 'BABYSITTER', activeKind)}
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center text-sm text-zinc-600">
          No hay perfiles que coincidan o la API no está disponible. Comprueba{' '}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_API_URL</code> y
          que el backend esté en marcha.
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <li key={p.id}>
              <ProviderCard p={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
