import { type Stripe, loadStripe } from '@stripe/stripe-js';

let cachedPk: string | null = null;
let cachedPromise: Promise<Stripe | null> | null = null;

/** Una sola instancia por publishable key (evita condiciones de carrera con React Strict Mode). */
export function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  const pk = publishableKey.trim();
  if (!pk) return Promise.resolve(null);
  if (cachedPk === pk && cachedPromise) return cachedPromise;
  cachedPk = pk;
  cachedPromise = loadStripe(pk);
  return cachedPromise;
}
