import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

import { Public } from '../auth/public.decorator';
import { StripeService } from '../stripe/stripe.service';
import { PaymentsService } from './payments.service';

@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly payments: PaymentsService,
  ) {}

  @Public()
  @Post('stripe')
  @HttpCode(200)
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const raw = req.rawBody;
    if (!Buffer.isBuffer(raw)) {
      throw new BadRequestException('Cuerpo raw requerido para webhooks Stripe');
    }
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET no configurado');
    }
    if (!signature) {
      throw new BadRequestException('Falta cabecera stripe-signature');
    }

    const stripe = this.stripeService.getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, signature, secret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Webhook Stripe inválido: ${msg}`);
    }

    await this.payments.handleStripeEvent(event);
    return { received: true };
  }
}
