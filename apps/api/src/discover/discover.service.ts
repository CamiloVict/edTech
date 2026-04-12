import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OnboardingStep,
  ProviderKind,
  ProviderProfile,
  UserRole,
} from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';

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

  async listAvailable(kind?: ProviderKind): Promise<DiscoverProviderRow[]> {
    const rows = await this.prisma.providerProfile.findMany({
      where: {
        isAvailable: true,
        isProfileCompleted: true,
        user: {
          role: UserRole.PROVIDER,
          onboardingStep: OnboardingStep.COMPLETED,
        },
        ...(kind ? { kinds: { has: kind } } : {}),
      },
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
