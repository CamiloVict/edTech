import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';

import { normalizeStripeKey } from './stripe-env.util';

@Injectable()
export class StripeService {
  private client: Stripe | null = null;

  getStripe(): Stripe {
    const key = normalizeStripeKey(process.env.STRIPE_SECRET_KEY);
    if (!key) {
      throw new ServiceUnavailableException(
        'Pagos no configurados: falta STRIPE_SECRET_KEY',
      );
    }
    if (!this.client) {
      this.client = new Stripe(key, {
        apiVersion: '2025-02-24.acacia',
        typescript: true,
      });
    }
    return this.client;
  }

  isConfigured(): boolean {
    return Boolean(normalizeStripeKey(process.env.STRIPE_SECRET_KEY));
  }
}
