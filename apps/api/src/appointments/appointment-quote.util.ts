import { RateUnit } from '@repo/database';

export type QuoteRateInput = {
  id: string;
  amountMinor: number;
  currency: string;
  unit: RateUnit;
  sortOrder: number;
};

export type AppointmentQuoteResult = {
  quotedAmountMinor: number;
  quotedCurrency: string;
  quotedRateUnit: RateUnit;
  providerRateId: string;
};

/**
 * Cotización alineada con la UI de reserva: prioridad HOUR → SESSION → DAY;
 * entre tarifas del mismo unit se usa menor `sortOrder`, luego menor precio.
 */
export function quoteAppointmentFromRates(
  rates: QuoteRateInput[],
  startsAt: Date,
  endsAt: Date,
): AppointmentQuoteResult | null {
  if (rates.length === 0) return null;

  const sorted = [...rates].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.amountMinor - b.amountMinor;
  });

  const pick = (unit: RateUnit) => sorted.find((r) => r.unit === unit);

  const durationMs = endsAt.getTime() - startsAt.getTime();
  if (durationMs <= 0) return null;

  const hour = pick(RateUnit.HOUR);
  if (hour) {
    const hours = durationMs / 3_600_000;
    const quotedAmountMinor = Math.max(1, Math.round(hours * hour.amountMinor));
    return {
      quotedAmountMinor,
      quotedCurrency: hour.currency.trim().toUpperCase(),
      quotedRateUnit: RateUnit.HOUR,
      providerRateId: hour.id,
    };
  }

  const session = pick(RateUnit.SESSION);
  if (session) {
    return {
      quotedAmountMinor: Math.max(1, session.amountMinor),
      quotedCurrency: session.currency.trim().toUpperCase(),
      quotedRateUnit: RateUnit.SESSION,
      providerRateId: session.id,
    };
  }

  const day = pick(RateUnit.DAY);
  if (day) {
    const days = Math.max(1, Math.ceil(durationMs / 86_400_000));
    return {
      quotedAmountMinor: Math.max(1, days * day.amountMinor),
      quotedCurrency: day.currency.trim().toUpperCase(),
      quotedRateUnit: RateUnit.DAY,
      providerRateId: day.id,
    };
  }

  return null;
}
