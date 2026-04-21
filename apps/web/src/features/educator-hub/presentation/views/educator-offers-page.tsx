'use client';

import { useMemo, useState } from 'react';

import type { EducatorOffer, OfferStatus } from '@/features/educator-hub/domain/types';
import {
  formatAgeBands,
  formatMoneyMinor,
  formatOfferStatus,
  formatOfferType,
  formatServiceMode,
} from '@/features/educator-hub/application/educator-format';
import { buttonStyles } from '@/shared/components/ui/button';

const FILTERS: { id: 'all' | OfferStatus; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'PUBLISHED', label: 'Publicadas' },
  { id: 'DRAFT', label: 'Borradores' },
  { id: 'PAUSED', label: 'Pausadas' },
];

export function EducatorOffersPage({ offers }: { offers: EducatorOffer[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const list = useMemo(() => {
    if (filter === 'all') return offers;
    return offers.filter((o) => o.status === filter);
  }, [offers, filter]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Ofertas educativas</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Clases 1:1, talleres, mini cursos y rutas. El editor conectado al API llegará después.
          </p>
        </div>
        <button type="button" className={buttonStyles('primary', 'shrink-0 rounded-xl')}>
          Crear oferta
        </button>
      </header>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f.id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {list.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center text-sm text-[var(--muted-foreground)]">
            Aún no tienes ofertas. Cuando activemos la creación desde aquí, podrás
            publicar servicios y paquetes.
          </li>
        ) : null}
        {list.map((o) => (
          <li
            key={o.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                    {formatOfferType(o.type)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      o.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : o.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {formatOfferStatus(o.status)}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{o.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--muted-foreground)]">{o.description}</p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="font-semibold tabular-nums text-[var(--primary)]">
                  {formatMoneyMinor(o.priceMinor, o.currency)}{' '}
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">COP</span>
                </p>
                <p className="text-[var(--muted-foreground)]">{o.durationMinutes} min</p>
                <p className="text-xs text-[var(--muted-foreground)]">{formatServiceMode(o.modality)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Edades {formatAgeBands(o.ageBands)} · {o.suggestedFrequency} · {o.viewsCount} vistas ·{' '}
              {o.bookingsCount} reservas
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={buttonStyles('secondary', 'rounded-lg py-2 text-xs')}>
                Editar
              </button>
              <button type="button" className={buttonStyles('secondary', 'rounded-lg py-2 text-xs')}>
                Duplicar
              </button>
              <button type="button" className={buttonStyles('ghost', 'rounded-lg py-2 text-xs')}>
                Pausar / Publicar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
