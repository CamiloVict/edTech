import type { ProviderAvailabilityBlockRow } from '@/features/providers/api/providers-api';

/** Hoy + los N−1 días siguientes en la lista rápida; fechas posteriores vía calendario de abajo. */
export const BOOKING_NEAR_WINDOW_DAY_COUNT = 3;

export type BookableSlot = {
  id: string;
  blockId: string;
  startsAt: string;
  endsAt: string;
};

/**
 * Genera franjas consecutivas no solapadas dentro de cada bloque publicado.
 * Omite tramos ya pasados respecto a `now`.
 */
export function generateBookableSlots(
  blocks: ProviderAvailabilityBlockRow[],
  slotMinutes: number,
  options?: { now?: Date; maxPerBlock?: number; maxTotal?: number },
): BookableSlot[] {
  const now = options?.now ?? new Date();
  const maxPerBlock = options?.maxPerBlock ?? 48;
  const maxTotal = options?.maxTotal ?? 120;
  const slotMs = slotMinutes * 60_000;
  if (slotMs <= 0) return [];

  const out: BookableSlot[] = [];

  for (const b of blocks) {
    const blockEnd = new Date(b.endsAt);
    if (blockEnd <= now) continue;

    let t = new Date(b.startsAt);
    while (t.getTime() + slotMs <= now.getTime()) {
      t = new Date(t.getTime() + slotMs);
    }

    let count = 0;
    while (count < maxPerBlock && out.length < maxTotal) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t.getTime() + slotMs);
      if (slotEnd > blockEnd) break;
      out.push({
        id: `${b.id}-${slotStart.getTime()}`,
        blockId: b.id,
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
      });
      count += 1;
      t = new Date(t.getTime() + slotMs);
    }
  }

  out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return out;
}

/** Solo franjas cuyo inicio cae en las primeras `visibleDayCount` fechas locales (desde hoy). */
export function filterSlotsToQuickPickHorizon(
  slots: BookableSlot[],
  now = new Date(),
  visibleDayCount = BOOKING_NEAR_WINDOW_DAY_COUNT,
): BookableSlot[] {
  if (visibleDayCount < 1) return [];
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const lastDay = new Date(startToday);
  lastDay.setDate(lastDay.getDate() + visibleDayCount - 1);
  lastDay.setHours(23, 59, 59, 999);
  return slots.filter((s) => {
    const t = new Date(s.startsAt).getTime();
    return t >= startToday.getTime() && t <= lastDay.getTime();
  });
}

export function formatSlotRangeLabel(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  const sameDay = s.toDateString() === e.toDateString();
  const day = s.toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const t1 = s.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const t2 = e.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) {
    return `${day} · ${t1} – ${t2}`;
  }
  const day2 = e.toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${day} ${t1} → ${day2} ${t2}`;
}

export function groupSlotsByDay(
  slots: BookableSlot[],
): { dayKey: string; dayTitle: string; slots: BookableSlot[] }[] {
  const map = new Map<string, { dayTitle: string; slots: BookableSlot[] }>();
  for (const slot of slots) {
    const d = new Date(slot.startsAt);
    const dayKey = d.toLocaleDateString('sv-SE');
    if (!map.has(dayKey)) {
      const dayTitle = d.toLocaleDateString('es', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      map.set(dayKey, { dayTitle, slots: [] });
    }
    map.get(dayKey)!.slots.push(slot);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, v]) => ({ dayKey, dayTitle: v.dayTitle, slots: v.slots }));
}
