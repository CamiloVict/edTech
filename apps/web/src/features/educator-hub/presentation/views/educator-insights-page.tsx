'use client';

import type { EducatorBadge, EducatorInsight, EducatorMetric } from '@/features/educator-hub/domain/types';

export function EducatorInsightsPage(props: {
  metrics: EducatorMetric[];
  insights: EducatorInsight[];
  badges: EducatorBadge[];
}) {
  const { metrics, insights, badges } = props;
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Metricas</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Indicadores e ideas de mejora (demo).</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <li key={m.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs uppercase text-[var(--muted-foreground)]">{m.label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{m.value}</p>
            {m.deltaLabel ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{m.deltaLabel}</p> : null}
          </li>
        ))}
      </ul>
      <section>
        <h2 className="text-base font-semibold">Sugerencias</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {insights.map((i) => (
            <li key={i.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="font-semibold">{i.title}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{i.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold">Badges</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {badges.map((b) => (
            <li key={b.id} className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
              <p className="font-semibold">{b.label}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{b.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
