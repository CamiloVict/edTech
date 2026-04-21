/**
 * Moneda única del producto (MVP: Colombia).
 * Mantener alineado con el default de `ProviderRate.currency` en Prisma.
 */
export const PLATFORM_DEFAULT_CURRENCY = 'COP' as const;

export type PlatformCurrency = typeof PLATFORM_DEFAULT_CURRENCY;
