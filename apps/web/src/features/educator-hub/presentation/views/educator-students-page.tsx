'use client';

import Link from 'next/link';

import type { EducatorStudent } from '@/features/educator-hub/domain/types';
import { formatShortDateTime } from '@/features/educator-hub/application/educator-format';

const REL: Record<EducatorStudent['relationship'], string> = {
  MOTHER: 'Madre',
  FATHER: 'Padre',
  TUTOR: 'Tutor/a',
  OTHER: 'Contacto',
};

export function EducatorStudentsPage({ students }: { students: EducatorStudent[] }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Estudiantes y familias</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Objetivos, etapa y próximos pasos. Notas privadas en el detalle.
        </p>
      </header>

      {students.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center text-sm text-[var(--muted-foreground)]">
          Cuando conectemos el CRM de estudiantes a tus citas, verás aquí a cada
          niño o niña con su familia y objetivos.
        </p>
      ) : (
      <ul className="grid gap-4 sm:grid-cols-2">
        {students.map((s) => (
          <li key={s.id}>
            <Link
              href={`/dashboard/provider/estudiantes/${s.id}`}
              className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{s.childFirstName}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {s.childAgeYears} años · {s.developmentStageLabel}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    s.active ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {s.active ? 'Activo' : 'Pausado'}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{s.familyName}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {REL[s.relationship]} · {s.contactEmail}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-[var(--muted-foreground)]">{s.progressSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                {s.nextSessionAt ? (
                  <span className="rounded-lg bg-[var(--muted)] px-2 py-1">
                    Próxima: {formatShortDateTime(s.nextSessionAt)}
                  </span>
                ) : (
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-900">Sin cita próxima</span>
                )}
                <span className="rounded-lg bg-[var(--muted)] px-2 py-1">{s.sessionsCount} sesiones</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
