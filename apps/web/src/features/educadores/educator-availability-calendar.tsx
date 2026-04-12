'use client';

import { useMemo } from 'react';

import type { ProviderDetailResponse } from '@/features/providers/api/providers-api';
import { AvailabilityFullCalendar } from '@/features/scheduling/components/availability-full-calendar';

type Block = ProviderDetailResponse['availabilityBlocks'][number];

export function EducatorAvailabilityCalendar({ blocks }: { blocks: Block[] }) {
  const parsed = useMemo(
    () =>
      blocks.map((b) => ({
        ...b,
        start: new Date(b.startsAt),
        end: new Date(b.endsAt),
      })),
    [blocks],
  );

  const upcomingList = useMemo(() => {
    const t = Date.now();
    return [...parsed]
      .filter((b) => b.end.getTime() > t)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 12);
  }, [parsed]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-950 sm:text-sm">
        <p className="font-semibold">Cómo leer el calendario</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-emerald-900/90">
          <li>
            Las franjas <span className="font-semibold">verdes</span> son
            ventanas en las que el educador acepta solicitudes de cita.
          </li>
          <li>
            Cambia a <span className="font-semibold">Semana</span> o{' '}
            <span className="font-semibold">Día</span> para ver horarios
            concretos; <span className="font-semibold">Lista</span> resume la
            semana en filas.
          </li>
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white p-2 shadow-sm sm:p-3">
        <AvailabilityFullCalendar blocks={blocks} height={520} />
      </div>

      {upcomingList.length > 0 ? (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">
            Próximas ventanas
          </h4>
          <ul className="mt-2 space-y-2">
            {upcomingList.map((b) => (
              <li
                key={b.id}
                className="flex gap-3 rounded-xl border border-stone-100 bg-white px-3 py-2.5 text-sm shadow-sm"
              >
                <span
                  className="w-1 shrink-0 rounded-full bg-linear-to-b from-emerald-500 to-emerald-800"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    {b.start.toLocaleString('es', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                    {' · '}
                    {b.start.toLocaleTimeString('es', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' – '}
                    {b.end.toLocaleTimeString('es', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {b.isAllDay ? (
                    <p className="mt-0.5 text-xs text-stone-500">
                      Día completo · {b.timezone}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-stone-500">
          No hay ventanas futuras publicadas en el calendario.
        </p>
      )}
    </div>
  );
}
