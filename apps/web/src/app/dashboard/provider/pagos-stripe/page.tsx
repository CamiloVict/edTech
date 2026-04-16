'use client';

import Link from 'next/link';

import { ProviderStripeSetupCard } from '@/features/payments/components/provider-stripe-setup-card';
import { AppHeader } from '@/shared/components/app-header';

export default function ProviderPagosStripePage() {
  const hubLinks = [
    { href: '/dashboard/provider', label: 'Panel', emphasized: true },
    { href: '/dashboard/provider/agenda', label: 'Agenda y horarios' },
    { href: '/profile/provider', label: 'Mi perfil' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader logoHref="/explorar" pageLabel="Educador" links={hubLinks} />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pagos con Stripe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecta tu cuenta para recibir el importe de las sesiones cuando las marques
            como terminadas.
          </p>
        </div>
        <ProviderStripeSetupCard />
        <p className="text-center text-sm">
          <Link
            href="/dashboard/provider"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Volver al panel
          </Link>
        </p>
      </main>
    </div>
  );
}
