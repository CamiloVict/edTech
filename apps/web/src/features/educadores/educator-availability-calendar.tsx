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
      <div className="rounded-xl border border-accent/30 bg-accent-soft/25 px-3 py-2.5 text-xs text-foreground sm:text-sm">
        <p className="font-semibold text-primary">Cómo leer el calendario</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-muted-foreground">
          <li>
            Las franjas en <span className="font-semibold text-primary">azul</span>{' '}
            son ventanas en las que el educador acepta solicitudes de clase.
          </li>
          <li>
            Cambia a <span className="font-semibold text-foreground">Semana</span>{' '}
            o <span className="font-semibold text-foreground">Día</span> para ver
            horarios concretos;{' '}
            <span className="font-semibold text-foreground">Lista</span> resume la
            semana en filas.
          </li>
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm sm:p-3">
        <AvailabilityFullCalendar blocks={blocks} height={560} />
      </div>

      {upcomingList.length > 0 ? (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Próximas ventanas
          </h4>
          <ul className="mt-2 space-y-2">
            {upcomingList.map((b) => (
              <li
                key={b.id}
                className="flex gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm"
              >
                <span
                  className="w-1 shrink-0 rounded-full bg-linear-to-b from-primary to-primary-hover"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Día completo · {b.timezone}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay ventanas futuras publicadas en el calendario.
        </p>
      )}
    </div>
  );
}
