import { Module } from '@nestjs/common';

import { PaymentsModule } from '../payments/payments.module';
import { ProviderOffersService } from '../provider-offers/provider-offers.service';
import { ProviderRatesService } from '../provider-rates/provider-rates.service';
import { UsersModule } from '../users/users.module';
import { ProviderProfilesController } from './provider-profiles.controller';
import { ProviderProfilesService } from './provider-profiles.service';

@Module({
  imports: [UsersModule, PaymentsModule],
  controllers: [ProviderProfilesController],
  providers: [ProviderProfilesService, ProviderRatesService, ProviderOffersService],
})
export class ProviderProfilesModule {}
