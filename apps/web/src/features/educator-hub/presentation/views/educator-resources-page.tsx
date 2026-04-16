'use client';

import { useMemo, useState } from 'react';

import type { EducatorResource, EducatorResourceType } from '@/features/educator-hub/domain/types';
import { formatAgeBands, formatResourceType } from '@/features/educator-hub/application/educator-format';
import { buttonStyles } from '@/shared/components/ui/button';

const TYPES: EducatorResourceType[] = ['GUIDE', 'ACTIVITY', 'TEMPLATE', 'TIP', 'BEST_PRACTICE'];

export function EducatorResourcesPage({ resources }: { resources: EducatorResource[] }) {
  const [typeFilter, setTypeFilter] = useState<EducatorResourceType | 'all'>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const list = useMemo(() => {
    let r = resources;
    if (typeFilter !== 'all') r = r.filter((x) => x.type === typeFilter);
    if (savedOnly) r = r.filter((x) => x.saved);
    return r;
  }, [resources, typeFilter, savedOnly]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Centro de recursos</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Biblioteca de guías y plantillas. El catálogo conectado llegará más adelante.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            typeFilter === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          }`}
        >
          Todos
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              typeFilter === t ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {formatResourceType(t)}
          </button>
        ))}
        <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          Solo guardados
        </label>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {list.length === 0 ? (
          <li className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center text-sm text-[var(--muted-foreground)]">
            No hay recursos en tu biblioteca todavía.
          </li>
        ) : null}
        {list.map((r) => (
          <li
            key={r.id}
            className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
          >
            <span className="w-fit rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold">
              {formatResourceType(r.type)}
            </span>
            <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">{r.title}</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--muted-foreground)]">{r.excerpt}</p>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {formatAgeBands(r.ageBands)} · {r.readMinutes} min
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" className={buttonStyles('primary', 'rounded-lg py-2 text-xs')}>
                Abrir
              </button>
              <button type="button" className={buttonStyles('secondary', 'rounded-lg py-2 text-xs')}>
                {r.saved ? 'Quitar' : 'Guardar'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
