import { BadRequestException } from '@nestjs/common';

/**
 * Limpia claves Stripe copiadas desde el dashboard (.env con comillas, espacios, BOM).
 */
export function normalizeStripeKey(raw: string | undefined): string {
  if (!raw) return '';
  let s = raw.trim();
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1).trim();
  }
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/\s+/g, '');
  return s;
}

export function assertPublishableKeyFormat(pk: string): void {
  if (pk.startsWith('sk_')) {
    throw new BadRequestException(
      'STRIPE_PUBLISHABLE_KEY no puede ser una secret key (sk_…). En Stripe Dashboard usa la clave «Publishable key» (pk_test_…).',
    );
  }
  if (pk.startsWith('rk_')) {
    throw new BadRequestException(
      'STRIPE_PUBLISHABLE_KEY no puede ser una restricted key (rk_…). Usa la «Standard» publishable (pk_test_…).',
    );
  }
  if (!/^pk_(test|live)_\S+$/.test(pk) || pk.length < 40) {
    throw new BadRequestException(
      'STRIPE_PUBLISHABLE_KEY no tiene formato válido (pk_test_… / pk_live_…, sin espacios ni comillas).',
    );
  }
}
