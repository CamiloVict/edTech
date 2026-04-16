import { BOOKING_NEAR_WINDOW_DAY_COUNT } from '@/features/educadores/lib/bookable-slots';

function toDatetimeLocalString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

function startOfLocalCalendarDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function getLocalCustomAlternativeMaxInstant(now = new Date()): Date {
  const startToday = startOfLocalCalendarDay(now);
  const max = new Date(startToday);
  max.setDate(max.getDate() + BOOKING_NEAR_WINDOW_DAY_COUNT - 1);
  max.setHours(23, 59, 59, 999);
  return max;
}

export function getLocalCustomAlternativeDatetimeInputs(now = new Date()) {
  const maxInstant = getLocalCustomAlternativeMaxInstant(now);
  return {
    minInput: toDatetimeLocalString(now),
    maxInput: toDatetimeLocalString(maxInstant),
    maxInstant,
    lastDayLabel: maxInstant.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  };
}

export function parseDatetimeLocal(s: string): Date | null {
  if (!s.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isCustomAlternativeRangeValid(
  startsLocal: string,
  endsLocal: string,
  now = new Date(),
): boolean {
  const start = parseDatetimeLocal(startsLocal);
  const end = parseDatetimeLocal(endsLocal);
  if (!start || !end || end <= start) return false;
  if (start.getTime() < now.getTime()) return false;
  if (end <= now) return false;
  const maxInstant = getLocalCustomAlternativeMaxInstant(now);
  if (start.getTime() > maxInstant.getTime()) return false;
  if (end.getTime() > maxInstant.getTime()) return false;
  return true;
}
