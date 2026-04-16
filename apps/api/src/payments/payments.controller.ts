import { Body, Controller, Get, Post } from '@nestjs/common';

import { CurrentClerkUser } from '../auth/current-clerk-user.decorator';
import { CompleteSetupIntentDto } from './dto/complete-setup-intent.dto';
import { CreateConnectAccountLinkDto } from './dto/create-connect-account-link.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('consumer/setup-intent')
  createConsumerSetupIntent(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.payments.createConsumerSetupIntent(clerk.clerkUserId);
  }

  @Post('consumer/complete-setup')
  async completeConsumerSetup(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: CompleteSetupIntentDto,
  ) {
    await this.payments.completeConsumerSetupIntent(clerk.clerkUserId, dto.setupIntentId);
    return { ok: true as const };
  }

  @Get('provider/stripe-status')
  providerStripeStatus(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.payments.getProviderStripeStatus(clerk.clerkUserId);
  }

  @Post('provider/connect-account-link')
  providerConnectAccountLink(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: CreateConnectAccountLinkDto,
  ) {
    return this.payments.createProviderConnectAccountLink(
      clerk.clerkUserId,
      dto.returnUrl,
      dto.refreshUrl,
    );
  }
}
