import type { ProviderRateRow } from '@/features/providers/api/providers-api';

/** Misma prioridad que el API: HOUR (proporcional) → SESSION → DAY. */
export function quoteFromProviderRatesForPreview(
  rates: ProviderRateRow[],
  durationMinutes: number,
): {
  priceMinor: number;
  currency: string;
  basis: 'HOUR' | 'SESSION' | 'DAY';
} | null {
  const sorted = [...rates].sort((a, b) => a.sortOrder - b.sortOrder);
  const hourRates = sorted.filter((r) => r.unit === 'HOUR');
  if (hourRates.length > 0) {
    const r = hourRates[0]!;
    const raw = (r.amountMinor * durationMinutes) / 60;
    const priceMinor = Math.max(1, Math.round(raw));
    return {
      priceMinor,
      currency: (r.currency || 'COP').trim().toUpperCase(),
      basis: 'HOUR',
    };
  }
  const sessionRates = sorted.filter((r) => r.unit === 'SESSION');
  if (sessionRates.length > 0) {
    const r = sessionRates[0]!;
    return {
      priceMinor: Math.max(1, r.amountMinor),
      currency: (r.currency || 'COP').trim().toUpperCase(),
      basis: 'SESSION',
    };
  }
  const dayRates = sorted.filter((r) => r.unit === 'DAY');
  if (dayRates.length > 0) {
    const r = dayRates[0]!;
    return {
      priceMinor: Math.max(1, r.amountMinor),
      currency: (r.currency || 'COP').trim().toUpperCase(),
      basis: 'DAY',
    };
  }
  return null;
}
