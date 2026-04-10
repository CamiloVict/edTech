import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ConsumerProfilesModule } from './consumer-profiles/consumer-profiles.module';
import { DiscoverModule } from './discover/discover.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProviderProfilesModule } from './provider-profiles/provider-profiles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    DiscoverModule,
    UsersModule,
    ConsumerProfilesModule,
    ProviderProfilesModule,
  ],
})
export class AppModule {}
