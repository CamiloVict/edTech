import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  OnboardingStep,
  Prisma,
  UserRole,
} from '@repo/database';
import { createClerkClient } from '@clerk/backend';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private clerk() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('CLERK_SECRET_KEY is not set');
    }
    return createClerkClient({ secretKey });
  }

  private async resolveEmail(clerkUserId: string): Promise<string> {
    try {
      const user = await this.clerk().users.getUser(clerkUserId);
      const primaryId = user.primaryEmailAddressId;
      const addr =
        user.emailAddresses?.find((e) => e.id === primaryId) ??
        user.emailAddresses?.[0];
      if (addr?.emailAddress) {
        return addr.emailAddress;
      }
    } catch {
      // Clerk unreachable: still allow placeholder for dev
    }
    return `${clerkUserId}@users.clerk.placeholder`;
  }

  async syncFromClerk(clerkUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (existing) {
      const email = await this.resolveEmail(clerkUserId);
      if (email && email !== existing.email) {
        return this.prisma.user.update({
          where: { id: existing.id },
          data: { email },
        });
      }
      return existing;
    }

    const email = await this.resolveEmail(clerkUserId);
    return this.prisma.user.create({
      data: {
        clerkUserId,
        email,
        onboardingStep: OnboardingStep.PENDING_ROLE,
      },
    });
  }

  async findByClerkOrThrow(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        consumerProfile: { include: { children: true } },
        providerProfile: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found. Call POST /users/sync first.');
    }
    return user;
  }

  async setRole(clerkUserId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { consumerProfile: true, providerProfile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found. Call POST /users/sync first.');
    }
    if (user.role !== null) {
      throw new ConflictException('Role is already set and cannot be changed.');
    }
    if (user.onboardingStep !== OnboardingStep.PENDING_ROLE) {
      throw new ConflictException('Invalid onboarding state for role selection.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          role,
          onboardingStep: OnboardingStep.PENDING_PROFILE,
        },
      });

      if (role === UserRole.CONSUMER) {
        await tx.consumerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      } else {
        await tx.providerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      }

      return updated;
    });
  }

  async getBootstrap(clerkUserId: string) {
    const user = await this.findByClerkOrThrow(clerkUserId);
    return this.buildBootstrap(user);
  }

  private buildBootstrap(
    user: Prisma.UserGetPayload<{
      include: {
        consumerProfile: { include: { children: true } };
        providerProfile: true;
      };
    }>,
  ) {
    const needsRoleSelection = user.role === null;
    const needsOnboarding =
      user.role !== null && user.onboardingStep !== OnboardingStep.COMPLETED;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingStep: user.onboardingStep,
        clerkUserId: user.clerkUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      needsRoleSelection,
      needsOnboarding,
      consumerProfile: user.consumerProfile
        ? {
            id: user.consumerProfile.id,
            fullName: user.consumerProfile.fullName,
            phone: user.consumerProfile.phone,
            city: user.consumerProfile.city,
            relationshipToChild: user.consumerProfile.relationshipToChild,
            isProfileCompleted: user.consumerProfile.isProfileCompleted,
            children: user.consumerProfile.children.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              birthDate: c.birthDate,
              interests: c.interests,
              notes: c.notes,
            })),
          }
        : null,
      providerProfile: user.providerProfile
        ? {
            id: user.providerProfile.id,
            fullName: user.providerProfile.fullName,
            bio: user.providerProfile.bio,
            yearsOfExperience: user.providerProfile.yearsOfExperience,
            focusAreas: user.providerProfile.focusAreas,
            serviceMode: user.providerProfile.serviceMode,
            city: user.providerProfile.city,
            isProfileCompleted: user.providerProfile.isProfileCompleted,
            photoUrl: user.providerProfile.photoUrl,
            averageRating: Number(user.providerProfile.averageRating),
            ratingCount: user.providerProfile.ratingCount,
            isAvailable: user.providerProfile.isAvailable,
            availabilitySummary: user.providerProfile.availabilitySummary,
            kinds: user.providerProfile.kinds,
          }
        : null,
    };
  }

  constructor(private readonly prisma: PrismaService) {}
}
