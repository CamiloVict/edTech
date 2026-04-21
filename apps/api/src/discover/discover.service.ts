import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OnboardingStep,
  Prisma,
  ProviderKind,
  ProviderProfile,
  UserRole,
} from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';
import { type DiscoverListFilters } from './discover-list-filters';

export type DiscoverProviderRow = {
  id: string;
  fullName: string | null;
  bio: string | null;
  photoUrl: string | null;
  averageRating: number;
  ratingCount: number;
  availabilitySummary: string | null;
  kinds: ProviderKind[];
  city: string | null;
  yearsOfExperience: number | null;
  focusAreas: string[];
  serviceMode: string | null;
};

@Injectable()
export class DiscoverService {
  constructor(private readonly prisma: PrismaService) {}

  async listAvailable(filters?: DiscoverListFilters): Promise<DiscoverProviderRow[]> {
    const where: Prisma.ProviderProfileWhereInput = {
      isAvailable: true,
      isProfileCompleted: true,
      user: {
        role: UserRole.PROVIDER,
        onboardingStep: OnboardingStep.COMPLETED,
      },
    };

    if (filters?.kind) {
      where.kinds = { has: filters.kind };
    }
    if (filters?.serviceMode) {
      where.serviceMode = filters.serviceMode;
    }
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.minYearsExperience != null) {
      where.yearsOfExperience = { gte: filters.minYearsExperience };
    }
    if (filters?.minRating != null) {
      where.averageRating = {
        gte: new Prisma.Decimal(Math.min(5, filters.minRating).toFixed(2)),
      };
    }
    if (filters?.minReviewCount != null) {
      where.ratingCount = { gte: filters.minReviewCount };
    }
    if (filters?.focusTags?.length) {
      where.focusAreas = { hasSome: filters.focusTags };
    }
    if (filters?.search) {
      const s = filters.search;
      where.AND = [
        {
          OR: [
            { fullName: { contains: s, mode: 'insensitive' } },
            { bio: { contains: s, mode: 'insensitive' } },
            { city: { contains: s, mode: 'insensitive' } },
            { availabilitySummary: { contains: s, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const rows = await this.prisma.providerProfile.findMany({
      where,
      orderBy: [{ averageRating: 'desc' }, { ratingCount: 'desc' }],
      take: 48,
    });

    return rows.map((p) => this.toRow(p));
  }

  /** Ficha pública ampliada (sin tarifas ni bloques de calendario). */
  async getPublicProfile(providerProfileId: string): Promise<DiscoverProviderRow> {
    const p = await this.prisma.providerProfile.findFirst({
      where: {
        id: providerProfileId,
        isAvailable: true,
        isProfileCompleted: true,
        user: {
          role: UserRole.PROVIDER,
          onboardingStep: OnboardingStep.COMPLETED,
        },
      },
    });
    if (!p) {
      throw new NotFoundException('Provider not found');
    }
    return this.toRow(p);
  }

  private toRow(p: ProviderProfile): DiscoverProviderRow {
    return {
      id: p.id,
      fullName: p.fullName,
      bio: p.bio,
      photoUrl: p.photoUrl,
      averageRating: Number(p.averageRating),
      ratingCount: p.ratingCount,
      availabilitySummary: p.availabilitySummary,
      kinds: p.kinds,
      city: p.city,
      yearsOfExperience: p.yearsOfExperience,
      focusAreas: p.focusAreas,
      serviceMode: p.serviceMode,
    };
  }
}
