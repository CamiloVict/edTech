import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private client: Stripe | null = null;

  getClient(): Stripe {
    if (this.client) {
      return this.client;
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is not set');
    }
    this.client = new Stripe(secretKey);
    return this.client;
  }

  getWebhookSecret(): string {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('STRIPE_WEBHOOK_SECRET is not set');
    }
    return secret;
  }
}
