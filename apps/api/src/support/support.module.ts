import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { SupportAdminController } from './support-admin.controller';
import { SupportAdminGuard } from './support-admin.guard';
import { SupportResolutionService } from './support-resolution.service';
import { SupportService } from './support.service';
import { SupportTicketsController } from './tickets.controller';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [SupportTicketsController, SupportAdminController],
  providers: [SupportService, SupportResolutionService, SupportAdminGuard],
  exports: [SupportService],
})
export class SupportModule {}
