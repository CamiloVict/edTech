import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { ConsumerProfilesController } from './consumer-profiles.controller';
import { ConsumerProfilesService } from './consumer-profiles.service';

@Module({
  imports: [UsersModule],
  controllers: [ConsumerProfilesController],
  providers: [ConsumerProfilesService],
})
export class ConsumerProfilesModule {}
