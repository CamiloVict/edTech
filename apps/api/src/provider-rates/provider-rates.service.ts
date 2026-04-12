import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateProviderRateDto } from './dto/create-provider-rate.dto';
import { UpdateProviderRateDto } from './dto/update-provider-rate.dto';

@Injectable()
export class ProviderRatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  private async requireProvider(clerkUserId: string) {
    const user = await this.users.findByClerkOrThrow(clerkUserId);
    if (user.role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Provider role required');
    }
    const profile = user.providerProfile;
    if (!profile) {
      throw new NotFoundException('Provider profile missing');
    }
    return { profile };
  }

  async listMine(clerkUserId: string) {
    const { profile } = await this.requireProvider(clerkUserId);
    return this.prisma.providerRate.findMany({
      where: { providerProfileId: profile.id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createMine(clerkUserId: string, dto: CreateProviderRateDto) {
    const { profile } = await this.requireProvider(clerkUserId);
    return this.prisma.providerRate.create({
      data: {
        providerProfileId: profile.id,
        label: dto.label?.trim() || null,
        amountMinor: dto.amountMinor,
        currency: (dto.currency ?? 'EUR').toUpperCase(),
        unit: dto.unit,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateMine(
    clerkUserId: string,
    rateId: string,
    dto: UpdateProviderRateDto,
  ) {
    const { profile } = await this.requireProvider(clerkUserId);
    const existing = await this.prisma.providerRate.findFirst({
      where: { id: rateId, providerProfileId: profile.id },
    });
    if (!existing) {
      throw new NotFoundException('Rate not found');
    }
    return this.prisma.providerRate.update({
      where: { id: rateId },
      data: {
        label:
          dto.label === undefined
            ? undefined
            : dto.label === null
              ? null
              : dto.label.trim() || null,
        amountMinor: dto.amountMinor,
        currency: dto.currency !== undefined ? dto.currency.toUpperCase() : undefined,
        unit: dto.unit,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async deleteMine(clerkUserId: string, rateId: string) {
    const { profile } = await this.requireProvider(clerkUserId);
    const existing = await this.prisma.providerRate.findFirst({
      where: { id: rateId, providerProfileId: profile.id },
    });
    if (!existing) {
      throw new NotFoundException('Rate not found');
    }
    await this.prisma.providerRate.delete({ where: { id: rateId } });
    return { deleted: true };
  }
}
