'use client';

import { ProviderSchedulingSection } from '@/features/scheduling/components/provider-scheduling-section';

export function EducatorAgendaPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Agenda y disponibilidad</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Las solicitudes pendientes aparecen arriba; el calendario de ventanas usa todo el ancho
          disponible para que sea más cómodo de leer y editar.
        </p>
      </header>
      <ProviderSchedulingSection />
    </div>
  );
}
