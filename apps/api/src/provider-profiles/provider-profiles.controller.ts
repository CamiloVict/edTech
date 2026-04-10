import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { CurrentClerkUser } from '../auth/current-clerk-user.decorator';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { ProviderProfilesService } from './provider-profiles.service';

@Controller('provider-profiles')
export class ProviderProfilesController {
  constructor(private readonly service: ProviderProfilesService) {}

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
