'use client';

import dynamic from 'next/dynamic';

import type { AppointmentRow } from '@/features/appointments/api/appointments-api';

const ConsumerLessonsCalendarLazy = dynamic(
  () =>
    import('./consumer-lessons-calendar-core').then(
      (m) => m.ConsumerLessonsCalendarCore,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground"
        aria-hidden
      >
        Cargando calendario…
      </div>
    ),
  },
);

export function ConsumerLessonsCalendar({
  appointments,
  height,
}: {
  appointments: AppointmentRow[];
  height?: number | string;
}) {
  return (
    <ConsumerLessonsCalendarLazy appointments={appointments} height={height} />
  );
}
