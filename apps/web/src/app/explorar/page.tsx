import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { syncUserWithToken } from '@/features/bootstrap/server-sync';
import { ProviderDiscovery } from '@/features/discover/provider-discovery';
import { PublicSiteHeader } from '@/shared/components/public-site-header';

export default async function ExplorarPage() {
  const a = await auth();
  if (a.userId) {
    const token = await a.getToken();
    if (token) {
      try {
        const data = await syncUserWithToken(token);
        const b = data?.bootstrap;
        if (
          b &&
          !b.needsRoleSelection &&
          !b.needsOnboarding &&
          b.user.role === 'PROVIDER'
        ) {
          redirect('/dashboard/provider');
        }
      } catch {
        // Si falla el sync, se muestra el catálogo (p. ej. API caída).
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PublicSiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Educadores y cuidadores
        </h1>
        <p className="mt-2 text-sm text-stone-600 sm:text-base">
          Abre una tarjeta para ver la ficha completa: trayectoria, calendario,
          tarifas (con sesión) y reserva.
        </p>
        <div className="mt-8">
          <ProviderDiscovery />
        </div>
      </main>
    </div>
  );
}
