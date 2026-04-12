'use client';

import { useMemo, useState } from 'react';

import type { ProviderDetailResponse } from '@/features/providers/api/providers-api';

type Block = ProviderDetailResponse['availabilityBlocks'][number];

function overlapsDay(blockStart: Date, blockEnd: Date, day: Date): boolean {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return blockStart <= end && blockEnd >= start;
}

function monthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7; // Monday = 0
  const weeks: (Date | null)[][] = [];
  let current: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) {
    current.push(null);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    current.push(new Date(year, month, d));
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }
  return weeks;
}

const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function EducatorAvailabilityCalendar({
  blocks,
}: {
  blocks: Block[];
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({
    y: now.getFullYear(),
    m: now.getMonth(),
  });

  const parsed = useMemo(
    () =>
      blocks.map((b) => ({
        ...b,
        start: new Date(b.startsAt),
        end: new Date(b.endsAt),
      })),
    [blocks],
  );

  const matrix = useMemo(
    () => monthMatrix(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const title = new Date(cursor.y, cursor.m, 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  });

  const upcomingList = useMemo(() => {
    const t = Date.now();
    return [...parsed]
      .filter((b) => b.end.getTime() > t)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 12);
  }, [parsed]);

  function hasBlockOnDay(day: Date): boolean {
    return parsed.some((b) => overlapsDay(b.start, b.end, day));
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 bg-emerald-950/[0.03] px-4 py-3">
          <button
            type="button"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m - 1, 1);
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
            }}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <h3 className="text-sm font-bold capitalize text-stone-900 sm:text-base">
            {title}
          </h3>
          <button
            type="button"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m + 1, 1);
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
            }}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">
            {weekdayLabels.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 space-y-1">
            {matrix.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <div
                        key={`e-${wi}-${di}`}
                        className="aspect-square rounded-lg bg-transparent"
                      />
                    );
                  }
                  const active = hasBlockOnDay(day);
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={day.toISOString()}
                      className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium sm:text-sm ${
                        active
                          ? 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300/60'
                          : 'bg-stone-50/80 text-stone-500'
                      } ${isToday ? 'ring-2 ring-emerald-700 ring-offset-1' : ''}`}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-stone-500">
            Los días resaltados tienen al menos una ventana publicada (parcial o
            día completo).
          </p>
        </div>
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
                  className="w-1 shrink-0 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-800"
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
