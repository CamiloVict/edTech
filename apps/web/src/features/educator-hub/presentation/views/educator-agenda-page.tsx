'use client';

import { ProviderSchedulingSection } from '@/features/scheduling/components/provider-scheduling-section';

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function WeekStripPreview() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Vista semanal (resumen)</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Mock visual. Estados: disponible, confirmada, pendiente, bloqueado.
      </p>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[var(--muted-foreground)]">
        {DAYS.map((d) => (
          <div key={d} className="py-2 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid min-h-[100px] grid-cols-7 gap-1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-2 text-[10px]"
          >
            {i === 1 ? <span className="font-semibold text-[var(--primary)]">9:00 1:1</span> : null}
            {i === 3 ? <span className="font-semibold text-amber-800">16:30 pend.</span> : null}
            {i === 5 ? <span className="font-semibold text-[var(--primary)]">10:00 taller</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EducatorAgendaPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Agenda y disponibilidad</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Calendario real abajo; resumen semanal es placeholder hasta unificar API.
        </p>
      </header>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <WeekStripPreview />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">Panel de detalle</p>
            <p className="mt-2">Buffer 15 min. Limite semanal 18 h (demo). Filtros por modalidad proximamente.</p>
          </div>
        </div>
        <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <ProviderSchedulingSection />
        </div>
      </div>
    </div>
  );
}
