import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnboardingStep, UserRole } from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto';

@Injectable()
export class ConsumerProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  private async requireConsumer(clerkUserId: string) {
    const user = await this.users.findByClerkOrThrow(clerkUserId);
    if (user.role !== UserRole.CONSUMER) {
      throw new ForbiddenException('Consumer role required');
    }
    const profile = user.consumerProfile;
    if (!profile) {
      throw new NotFoundException('Consumer profile missing');
    }
    return { user, profile };
  }

  async getMe(clerkUserId: string) {
    const { profile } = await this.requireConsumer(clerkUserId);
    return this.prisma.consumerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { children: true },
    });
  }

  async updateMe(clerkUserId: string, dto: UpdateConsumerProfileDto) {
    const { profile } = await this.requireConsumer(clerkUserId);
    return this.prisma.consumerProfile.update({
      where: { id: profile.id },
      data: {
        fullName: dto.fullName ?? undefined,
        phone: dto.phone ?? undefined,
        city: dto.city ?? undefined,
        relationshipToChild: dto.relationshipToChild ?? undefined,
      },
      include: { children: true },
    });
  }

  async listChildren(clerkUserId: string) {
    const { profile } = await this.requireConsumer(clerkUserId);
    return this.prisma.child.findMany({
      where: { consumerProfileId: profile.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addChild(clerkUserId: string, dto: CreateChildDto) {
    const { profile } = await this.requireConsumer(clerkUserId);
    return this.prisma.child.create({
      data: {
        consumerProfileId: profile.id,
        firstName: dto.firstName,
        birthDate: new Date(dto.birthDate),
        interests: dto.interests,
        notes: dto.notes,
      },
    });
  }

  async updateChild(clerkUserId: string, childId: string, dto: UpdateChildDto) {
    const { profile } = await this.requireConsumer(clerkUserId);
    const child = await this.prisma.child.findFirst({
      where: { id: childId, consumerProfileId: profile.id },
    });
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    return this.prisma.child.update({
      where: { id: child.id },
      data: {
        firstName: dto.firstName ?? undefined,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        interests: dto.interests ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
  }

  async removeChild(clerkUserId: string, childId: string) {
    const { profile } = await this.requireConsumer(clerkUserId);
    const child = await this.prisma.child.findFirst({
      where: { id: childId, consumerProfileId: profile.id },
    });
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    await this.prisma.child.delete({ where: { id: child.id } });
    return { deleted: true };
  }

  async completeOnboarding(clerkUserId: string) {
    const { user, profile } = await this.requireConsumer(clerkUserId);
    if (user.onboardingStep === OnboardingStep.COMPLETED) {
      return this.getMe(clerkUserId);
    }

    const withChildren = await this.prisma.consumerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { children: true },
    });

    if (!withChildren.fullName?.trim()) {
      throw new BadRequestException('fullName is required to complete onboarding');
    }
    if (!withChildren.phone?.trim()) {
      throw new BadRequestException('phone is required to complete onboarding');
    }
    if (!withChildren.city?.trim()) {
      throw new BadRequestException('city is required to complete onboarding');
    }
    if (!withChildren.relationshipToChild?.trim()) {
      throw new BadRequestException(
        'relationshipToChild is required to complete onboarding',
      );
    }
    if (withChildren.children.length < 1) {
      throw new BadRequestException('At least one child is required');
    }

    await this.prisma.$transaction([
      this.prisma.consumerProfile.update({
        where: { id: profile.id },
        data: {
          isProfileCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { onboardingStep: OnboardingStep.COMPLETED },
      }),
    ]);

    return this.getMe(clerkUserId);
  }
}
