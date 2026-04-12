import { ProviderDiscovery } from '@/features/discover/provider-discovery';
import { PublicSiteHeader } from '@/shared/components/public-site-header';

export default function ExplorarPage() {
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
