import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentClerkUser } from '../auth/current-clerk-user.decorator';
import { CreateProviderRateDto } from '../provider-rates/dto/create-provider-rate.dto';
import { UpdateProviderRateDto } from '../provider-rates/dto/update-provider-rate.dto';
import { ProviderRatesService } from '../provider-rates/provider-rates.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { ProviderProfilesService } from './provider-profiles.service';

@Controller('provider-profiles')
export class ProviderProfilesController {
  constructor(
    private readonly service: ProviderProfilesService,
    private readonly rates: ProviderRatesService,
  ) {}

  @Get('me/rates')
  listRates(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.rates.listMine(clerk.clerkUserId);
  }

  @Post('me/rates')
  createRate(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: CreateProviderRateDto,
  ) {
    return this.rates.createMine(clerk.clerkUserId, dto);
  }

  @Patch('me/rates/:rateId')
  updateRate(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Param('rateId') rateId: string,
    @Body() dto: UpdateProviderRateDto,
  ) {
    return this.rates.updateMine(clerk.clerkUserId, rateId, dto);
  }

  @Delete('me/rates/:rateId')
  deleteRate(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Param('rateId') rateId: string,
  ) {
    return this.rates.deleteMine(clerk.clerkUserId, rateId);
  }

  @Get('me')
  me(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.service.getMe(clerk.clerkUserId);
  }

  @Patch('me')
  updateMe(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: UpdateProviderProfileDto,
  ) {
    return this.service.updateMe(clerk.clerkUserId, dto);
  }

  @Post('me/complete')
  complete(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.service.completeOnboarding(clerk.clerkUserId);
  }
}
