import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AppointmentPaymentStatus,
  AppointmentStatus,
  Prisma,
  UserRole,
} from '@repo/database';
import Stripe from 'stripe';

import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import {
  assertPublishableKeyFormat,
  normalizeStripeKey,
} from '../stripe/stripe-env.util';

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function applicationFeeMinor(amountMinor: number): number {
  const raw = process.env.STRIPE_PLATFORM_FEE_BPS ?? '1000';
  const bps = Number(raw);
  const safeBps = Number.isFinite(bps) && bps >= 0 && bps <= 10000 ? bps : 1000;
  const fee = Math.round((amountMinor * safeBps) / 10_000);
  if (fee <= 0) return 0;
  return Math.min(fee, Math.max(0, amountMinor - 1));
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  private stripe(): Stripe {
    return this.stripeService.getStripe();
  }

  async createConsumerSetupIntent(clerkUserId: string): Promise<{
    clientSecret: string;
    stripePublishableKey: string;
  }> {
    const pk = normalizeStripeKey(process.env.STRIPE_PUBLISHABLE_KEY);
    if (!pk) {
      throw new ServiceUnavailableException('Falta STRIPE_PUBLISHABLE_KEY');
    }
    assertPublishableKeyFormat(pk);

    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { consumerProfile: true },
    });
    if (!user || user.role !== UserRole.CONSUMER || !user.consumerProfile) {
      throw new ForbiddenException('Solo familias pueden registrar método de pago');
    }

    const profile = user.consumerProfile;
    const stripe = this.stripe();

    const setupIntent = await stripe.setupIntents.create({
      ...(profile.stripeCustomerId
        ? { customer: profile.stripeCustomerId }
        : {}),
      usage: 'off_session',
      payment_method_types: ['card'],
      metadata: {
        consumerProfileId: profile.id,
        clerkUserId,
      },
    });

    const secret = setupIntent.client_secret;
    if (!secret) {
      throw new BadRequestException('Stripe no devolvió client_secret del SetupIntent');
    }

    return { clientSecret: secret, stripePublishableKey: pk };
  }

  async completeConsumerSetupIntent(
    clerkUserId: string,
    setupIntentId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { consumerProfile: true },
    });
    if (!user || user.role !== UserRole.CONSUMER || !user.consumerProfile) {
      throw new ForbiddenException('Solo familias pueden completar este paso');
    }

    const profile = user.consumerProfile;
    const stripe = this.stripe();
    const si = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ['payment_method'],
    });

    if (si.metadata?.consumerProfileId !== profile.id) {
      throw new ForbiddenException('Este SetupIntent no pertenece a tu cuenta');
    }
    if (si.status !== 'succeeded') {
      throw new BadRequestException(
        `El método de pago aún no está listo (estado: ${si.status})`,
      );
    }

    await this.syncConsumerPaymentFromSetupIntent(stripe, si);
  }

  /**
   * Tras SetupIntent succeeded: Customer (si hace falta), adjuntar PM, default, guardar en BD.
   * Idempotente ante webhooks duplicados o reintentos.
   */
  private async syncConsumerPaymentFromSetupIntent(
    stripe: Stripe,
    si: Stripe.SetupIntent,
  ): Promise<void> {
    const consumerProfileId = si.metadata?.consumerProfileId;
    if (!consumerProfileId || si.status !== 'succeeded') return;

    const pmObj = si.payment_method;
    const pmId =
      typeof pmObj === 'string'
        ? pmObj
        : pmObj && typeof pmObj === 'object' && 'id' in pmObj
          ? (pmObj as Stripe.PaymentMethod).id
          : null;
    if (!pmId) return;

    const profile = await this.prisma.consumerProfile.findUnique({
      where: { id: consumerProfileId },
      include: { user: true },
    });
    if (!profile?.user?.email) return;

    let customerId =
      profile.stripeCustomerId ??
      (typeof si.customer === 'string' ? si.customer : si.customer?.id) ??
      null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.user.email,
        metadata: {
          consumerProfileId: profile.id,
        },
      });
      customerId = customer.id;
    }

    try {
      await stripe.paymentMethods.attach(pmId, { customer: customerId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('already been attached')) {
        throw e;
      }
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: pmId },
    });

    await this.prisma.consumerProfile.update({
      where: { id: consumerProfileId },
      data: { stripeCustomerId: customerId },
    });
  }

  async getProviderStripeStatus(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { providerProfile: true },
    });
    if (!user || user.role !== UserRole.PROVIDER || !user.providerProfile) {
      throw new ForbiddenException('Solo educadores pueden ver el estado de pagos');
    }
    const p = user.providerProfile;
    return {
      stripeConnectAccountId: p.stripeConnectAccountId,
      stripeChargesEnabled: p.stripeChargesEnabled,
      stripePayoutsEnabled: p.stripePayoutsEnabled,
      needsOnboarding:
        !p.stripeConnectAccountId ||
        !p.stripeChargesEnabled ||
        !p.stripePayoutsEnabled,
    };
  }

  async createProviderConnectAccountLink(
    clerkUserId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { providerProfile: true },
    });
    if (!user || user.role !== UserRole.PROVIDER || !user.providerProfile) {
      throw new ForbiddenException('Solo educadores pueden conectar Stripe');
    }

    const profile = user.providerProfile;
    const stripe = this.stripe();
    const country = (process.env.STRIPE_CONNECT_DEFAULT_COUNTRY ?? 'US').trim();

    let accountId = profile.stripeConnectAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          providerProfileId: profile.id,
          clerkUserId,
        },
      });
      accountId = account.id;
      await this.prisma.providerProfile.update({
        where: { id: profile.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  /**
   * Autoriza el cobro (captura manual) al confirmar la cita.
   * Si requiere acción del cliente (3DS), no cambia el estado de la cita; el webhook o reintento lo resuelve.
   */
  async authorizeAppointmentPayment(appointmentId: string): Promise<
    | { authorized: true }
    | {
        requiresAction: true;
        clientSecret: string;
        paymentIntentId: string;
      }
  > {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consumerProfile: true,
        providerProfile: true,
        payment: true,
      },
    });

    if (!appt) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (
      appt.quotedAmountMinor == null ||
      appt.quotedCurrency == null ||
      appt.quotedAmountMinor < 1
    ) {
      // Citas creadas antes de la cotización en servidor: confirmar sin pasar por Stripe.
      return { authorized: true };
    }

    const consumer = appt.consumerProfile;
    const provider = appt.providerProfile;

    if (!consumer.stripeCustomerId) {
      throw new BadRequestException(
        'La familia debe añadir un método de pago antes de confirmar la cita',
      );
    }

    if (!provider.stripeConnectAccountId || !provider.stripeChargesEnabled) {
      throw new BadRequestException(
        'Debes completar la cuenta de pagos Stripe antes de confirmar citas con cobro',
      );
    }

    const stripe = this.stripe();
    const amountMinor = appt.quotedAmountMinor;
    const currency = appt.quotedCurrency.toLowerCase();
    const feeMinor = applicationFeeMinor(amountMinor);

    if (appt.payment?.status === AppointmentPaymentStatus.AUTHORIZED) {
      return { authorized: true };
    }

    const customer = await stripe.customers.retrieve(consumer.stripeCustomerId, {
      expand: ['invoice_settings.default_payment_method'],
    });
    if (customer.deleted) {
      throw new BadRequestException('Customer de Stripe inválido');
    }
    const defaultPm =
      typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id;
    if (!defaultPm) {
      throw new BadRequestException(
        'La familia debe tener un método de pago por defecto (vuelve a guardar la tarjeta en Mi espacio)',
      );
    }

    const intent = await stripe.paymentIntents.create(
      {
        amount: amountMinor,
        currency,
        customer: consumer.stripeCustomerId,
        payment_method: defaultPm,
        capture_method: 'manual',
        confirm: true,
        off_session: true,
        automatic_payment_methods: { enabled: false },
        payment_method_types: ['card'],
        application_fee_amount: feeMinor,
        transfer_data: {
          destination: provider.stripeConnectAccountId,
        },
        metadata: {
          appointmentId: appt.id,
          consumerProfileId: consumer.id,
          providerProfileId: provider.id,
        },
        description: `TrofoSchool — sesión ${appt.id}`,
      },
      { idempotencyKey: `appt_auth_${appt.id}` },
    );

    if (intent.status === 'requires_action') {
      const clientSecret = intent.client_secret;
      if (!clientSecret) {
        throw new BadRequestException('Stripe requiere acción pero no devolvió client_secret');
      }
      await this.prisma.appointmentPayment.upsert({
        where: { appointmentId: appt.id },
        create: {
          appointmentId: appt.id,
          stripePaymentIntentId: intent.id,
          status: AppointmentPaymentStatus.REQUIRES_ACTION,
          amountMinor,
          currency: appt.quotedCurrency,
          applicationFeeMinor: feeMinor,
        },
        update: {
          stripePaymentIntentId: intent.id,
          status: AppointmentPaymentStatus.REQUIRES_ACTION,
          amountMinor,
          currency: appt.quotedCurrency,
          applicationFeeMinor: feeMinor,
        },
      });
      return {
        requiresAction: true,
        clientSecret,
        paymentIntentId: intent.id,
      };
    }

    if (intent.status === 'requires_capture' || intent.status === 'succeeded') {
      await this.prisma.appointmentPayment.upsert({
        where: { appointmentId: appt.id },
        create: {
          appointmentId: appt.id,
          stripePaymentIntentId: intent.id,
          status: AppointmentPaymentStatus.AUTHORIZED,
          amountMinor,
          currency: appt.quotedCurrency,
          applicationFeeMinor: feeMinor,
        },
        update: {
          stripePaymentIntentId: intent.id,
          status: AppointmentPaymentStatus.AUTHORIZED,
          amountMinor,
          currency: appt.quotedCurrency,
          applicationFeeMinor: feeMinor,
        },
      });
      return { authorized: true };
    }

    await this.prisma.appointmentPayment.upsert({
      where: { appointmentId: appt.id },
      create: {
        appointmentId: appt.id,
        stripePaymentIntentId: intent.id,
        status: AppointmentPaymentStatus.FAILED,
        amountMinor,
        currency: appt.quotedCurrency,
        applicationFeeMinor: feeMinor,
      },
      update: {
        stripePaymentIntentId: intent.id,
        status: AppointmentPaymentStatus.FAILED,
        amountMinor,
        currency: appt.quotedCurrency,
        applicationFeeMinor: feeMinor,
      },
    });

    throw new UnprocessableEntityException(
      intent.last_payment_error?.message ??
        `No se pudo autorizar el pago (estado Stripe: ${intent.status})`,
    );
  }

  async cancelAuthorizationForAppointment(appointmentId: string): Promise<void> {
    const payment = await this.prisma.appointmentPayment.findUnique({
      where: { appointmentId },
    });
    if (!payment?.stripePaymentIntentId) return;

    if (
      payment.status !== AppointmentPaymentStatus.AUTHORIZED &&
      payment.status !== AppointmentPaymentStatus.REQUIRES_ACTION
    ) {
      return;
    }

    const stripe = this.stripe();
    try {
      await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('cannot be canceled')) {
        throw e;
      }
    }

    await this.prisma.appointmentPayment.update({
      where: { appointmentId },
      data: { status: AppointmentPaymentStatus.CANCELED },
    });
  }

  async captureAppointmentPayment(appointmentId: string): Promise<void> {
    const payment = await this.prisma.appointmentPayment.findUnique({
      where: { appointmentId },
    });
    if (!payment?.stripePaymentIntentId) {
      // Sin fila de pago (cita legada sin cotización / sin autorización Stripe).
      return;
    }
    if (payment.status === AppointmentPaymentStatus.CAPTURED) {
      return;
    }
    if (payment.status !== AppointmentPaymentStatus.AUTHORIZED) {
      throw new BadRequestException(
        'El pago no está en estado autorizado; no se puede capturar',
      );
    }

    const stripe = this.stripe();
    const captured = await stripe.paymentIntents.capture(payment.stripePaymentIntentId);

    if (captured.status !== 'succeeded') {
      throw new BadRequestException(
        `La captura no finalizó correctamente (estado: ${captured.status})`,
      );
    }

    await this.prisma.appointmentPayment.update({
      where: { appointmentId },
      data: { status: AppointmentPaymentStatus.CAPTURED },
    });
  }

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    const stripe = this.stripe();

    try {
      await this.prisma.stripeProcessedEvent.create({
        data: { stripeEventId: event.id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return;
      }
      throw e;
    }

    const type = event.type as string;

    if (type === 'account.updated') {
        const account = event.data.object as Stripe.Account;
        const id = account.id;
        await this.prisma.providerProfile.updateMany({
          where: { stripeConnectAccountId: id },
          data: {
            stripeChargesEnabled: Boolean(account.charges_enabled),
            stripePayoutsEnabled: Boolean(account.payouts_enabled),
          },
        });
    } else if (
      type === 'payment_intent.requires_capture' ||
      type === 'payment_intent.amount_capturable_updated'
    ) {
      const pi = event.data.object as Stripe.PaymentIntent;
      const apptId = pi.metadata?.appointmentId;
      if (!apptId) return;

      const appt = await this.prisma.appointment.findUnique({
        where: { id: apptId },
        include: { payment: true },
      });
      if (!appt) return;

      if (pi.status !== 'requires_capture' && pi.status !== 'processing') {
        return;
      }

      const pay = appt.payment;

      if (appt.status === AppointmentStatus.CONFIRMED) {
        await this.prisma.appointmentPayment.updateMany({
          where: { appointmentId: apptId },
          data: {
            status: AppointmentPaymentStatus.AUTHORIZED,
            lastStripeEventId: event.id,
          },
        });
        return;
      }

      if (appt.status !== AppointmentStatus.PENDING) return;
      if (pay?.status !== AppointmentPaymentStatus.REQUIRES_ACTION) return;

      const others = await this.prisma.appointment.findMany({
        where: {
          providerProfileId: appt.providerProfileId,
          status: AppointmentStatus.CONFIRMED,
          id: { not: apptId },
        },
      });
      for (const other of others) {
        if (
          rangesOverlap(
            appt.startsAt,
            appt.endsAt,
            other.startsAt,
            other.endsAt,
          )
        ) {
          try {
            await stripe.paymentIntents.cancel(pi.id);
          } catch {
            // ignore
          }
          await this.prisma.appointmentPayment.updateMany({
            where: { appointmentId: apptId },
            data: {
              status: AppointmentPaymentStatus.CANCELED,
              lastStripeEventId: event.id,
            },
          });
          return;
        }
      }

      await this.prisma.$transaction([
        this.prisma.appointmentPayment.update({
          where: { appointmentId: apptId },
          data: {
            status: AppointmentPaymentStatus.AUTHORIZED,
            lastStripeEventId: event.id,
          },
        }),
        this.prisma.appointment.update({
          where: { id: apptId },
          data: { status: AppointmentStatus.CONFIRMED },
        }),
      ]);
    } else if (type === 'payment_intent.canceled') {
        const pi = event.data.object as Stripe.PaymentIntent;
        const apptId = pi.metadata?.appointmentId;
        if (!apptId) return;
        await this.prisma.appointmentPayment.updateMany({
          where: { appointmentId: apptId },
          data: {
            status: AppointmentPaymentStatus.CANCELED,
            lastStripeEventId: event.id,
          },
        });
    } else if (type === 'setup_intent.succeeded') {
        const thin = event.data.object as Stripe.SetupIntent;
        const si = await stripe.setupIntents.retrieve(thin.id, {
          expand: ['payment_method'],
        });
        if (si.status === 'succeeded') {
          await this.syncConsumerPaymentFromSetupIntent(stripe, si);
        }
    }
  }
}
