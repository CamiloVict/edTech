'use client';

import dynamic from 'next/dynamic';

import type {
  AvailabilityBlockLike,
  AvailabilityFullCalendarCoreProps,
} from './availability-full-calendar-core';

export type { AvailabilityBlockLike, AvailabilityFullCalendarCoreProps };

const AvailabilityFullCalendarLazy = dynamic(
  () =>
    import('./availability-full-calendar-core').then(
      (m) => m.AvailabilityFullCalendarCore,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[480px] items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-500"
        aria-hidden
      >
        Cargando calendario…
      </div>
    ),
  },
);

export function AvailabilityFullCalendar(props: AvailabilityFullCalendarCoreProps) {
  return <AvailabilityFullCalendarLazy {...props} />;
}
