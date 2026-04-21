import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { ConsumerProfilesModule } from './consumer-profiles/consumer-profiles.module';
import { DiscoverModule } from './discover/discover.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProviderProfilesModule } from './provider-profiles/provider-profiles.module';
import { ProvidersModule } from './providers/providers.module';
import { SupportModule } from './support/support.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    PrismaModule,
    AuthModule,
    HealthModule,
    DiscoverModule,
    FeedbackModule,
    UsersModule,
    ConsumerProfilesModule,
    ProviderProfilesModule,
    AvailabilityModule,
    AppointmentsModule,
    ProvidersModule,
    SupportModule,
  ],
})
export class AppModule {}
