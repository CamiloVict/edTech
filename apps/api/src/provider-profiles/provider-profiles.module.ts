import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { ProviderProfilesController } from './provider-profiles.controller';
import { ProviderProfilesService } from './provider-profiles.service';

@Module({
  imports: [UsersModule],
  controllers: [ProviderProfilesController],
  providers: [ProviderProfilesService],
})
export class ProviderProfilesModule {}
