import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  Prisma,
  UserRole,
} from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ALTERNATIVE_SCHEDULE_UTC_DAY_SPAN,
  utcMaxInstantForAlternativeRequest,
} from './custom-alternative-limits';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PatchAppointmentDto } from './dto/patch-appointment.dto';

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function containedInBlock(
  apptStart: Date,
  apptEnd: Date,
  blockStart: Date,
  blockEnd: Date,
): boolean {
  return apptStart >= blockStart && apptEnd <= blockEnd;
}

@Injectable()
export class AppointmentsService {
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

  private async requireProvider(clerkUserId: string) {
    const user = await this.users.findByClerkOrThrow(clerkUserId);
    if (user.role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Provider role required');
    }
    const profile = user.providerProfile;
    if (!profile) {
      throw new NotFoundException('Provider profile missing');
    }
    return { user, profile };
  }

  private appointmentInclude(): Prisma.AppointmentInclude {
    return {
      providerProfile: {
        select: {
          id: true,
          fullName: true,
          city: true,
          photoUrl: true,
        },
      },
      consumerProfile: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          city: true,
        },
      },
      child: {
        select: { id: true, firstName: true },
      },
    };
  }

  async listMineConsumer(clerkUserId: string) {
    const { profile } = await this.requireConsumer(clerkUserId);
    return this.prisma.appointment.findMany({
      where: { consumerProfileId: profile.id },
      orderBy: { startsAt: 'desc' },
      include: this.appointmentInclude(),
    });
  }

  async listMineProvider(clerkUserId: string) {
    const { profile } = await this.requireProvider(clerkUserId);
    return this.prisma.appointment.findMany({
      where: { providerProfileId: profile.id },
      orderBy: { startsAt: 'asc' },
      include: this.appointmentInclude(),
    });
  }

  async create(clerkUserId: string, dto: CreateAppointmentDto) {
    const { profile } = await this.requireConsumer(clerkUserId);
    if (!profile.isProfileCompleted) {
      throw new ForbiddenException(
        'Complete your family profile before requesting an appointment',
      );
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const now = new Date();
    if (startsAt < now) {
      throw new BadRequestException('La hora de inicio debe ser en el futuro');
    }
    if (endsAt <= now) {
      throw new BadRequestException('Appointment must end in the future');
    }

    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: dto.providerProfileId },
    });
    if (!provider || !provider.isAvailable) {
      throw new NotFoundException('Provider not found or not available');
    }

    const children = await this.prisma.child.findMany({
      where: { consumerProfileId: profile.id },
      select: { id: true },
    });
    if (children.length === 0) {
      throw new BadRequestException(
        'Add at least one child to your profile before requesting an appointment',
      );
    }

    const child = await this.prisma.child.findFirst({
      where: {
        id: dto.childId,
        consumerProfileId: profile.id,
      },
    });
    if (!child) {
      throw new BadRequestException(
        'childId must be one of your registered children',
      );
    }

    const blocks = await this.prisma.providerAvailabilityBlock.findMany({
      where: {
        providerProfileId: dto.providerProfileId,
        endsAt: { gt: now },
      },
    });

    const alternative = dto.requestsAlternativeSchedule === true;

    if (!alternative) {
      const fits = blocks.some((b) =>
        containedInBlock(startsAt, endsAt, b.startsAt, b.endsAt),
      );
      if (!fits) {
        throw new BadRequestException(
          'Requested time is not within an availability block for this educator',
        );
      }
    } else {
      const note = dto.noteFromFamily?.trim() ?? '';
      if (note.length < 15) {
        throw new BadRequestException(
          'For a custom time request, add a note of at least 15 characters for the educator',
        );
      }
      const altMax = utcMaxInstantForAlternativeRequest(now);
      if (
        startsAt.getTime() > altMax.getTime() ||
        endsAt.getTime() > altMax.getTime()
      ) {
        throw new BadRequestException(
          `Las peticiones con otro horario solo admiten fechas dentro de los próximos ${ALTERNATIVE_SCHEDULE_UTC_DAY_SPAN} días calendario.`,
        );
      }
    }

    return this.prisma.appointment.create({
      data: {
        providerProfileId: dto.providerProfileId,
        consumerProfileId: profile.id,
        startsAt,
        endsAt,
        status: AppointmentStatus.PENDING,
        requestsAlternativeSchedule: alternative,
        noteFromFamily: dto.noteFromFamily?.trim() || null,
        childId: dto.childId,
      },
      include: this.appointmentInclude(),
    });
  }

  async patch(clerkUserId: string, appointmentId: string, dto: PatchAppointmentDto) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        providerProfile: true,
        consumerProfile: true,
      },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }

    const user = await this.users.findByClerkOrThrow(clerkUserId);
    const next = dto.status;

    if (user.role === UserRole.CONSUMER) {
      const profile = user.consumerProfile;
      if (!profile || appt.consumerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }
      if (next !== AppointmentStatus.CANCELLED_BY_FAMILY) {
        throw new BadRequestException('Consumers can only cancel appointments');
      }
      if (
        appt.status !== AppointmentStatus.PENDING &&
        appt.status !== AppointmentStatus.CONFIRMED
      ) {
        throw new BadRequestException('This appointment cannot be cancelled');
      }
      return this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED_BY_FAMILY },
        include: this.appointmentInclude(),
      });
    }

    if (user.role === UserRole.PROVIDER) {
      const profile = user.providerProfile;
      if (!profile || appt.providerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }

      if (
        next !== AppointmentStatus.CONFIRMED &&
        next !== AppointmentStatus.DECLINED &&
        next !== AppointmentStatus.CANCELLED_BY_PROVIDER
      ) {
        throw new BadRequestException('Invalid status for provider');
      }

      if (next === AppointmentStatus.CANCELLED_BY_PROVIDER) {
        if (
          appt.status !== AppointmentStatus.PENDING &&
          appt.status !== AppointmentStatus.CONFIRMED
        ) {
          throw new BadRequestException('This appointment cannot be cancelled');
        }
        return this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: AppointmentStatus.CANCELLED_BY_PROVIDER },
          include: this.appointmentInclude(),
        });
      }

      if (appt.status !== AppointmentStatus.PENDING && next === AppointmentStatus.CONFIRMED) {
        throw new BadRequestException('Only pending appointments can be confirmed');
      }
      if (appt.status !== AppointmentStatus.PENDING && next === AppointmentStatus.DECLINED) {
        throw new BadRequestException('Only pending appointments can be declined');
      }

      if (next === AppointmentStatus.CONFIRMED) {
        const confirmed = await this.prisma.appointment.findMany({
          where: {
            providerProfileId: appt.providerProfileId,
            status: AppointmentStatus.CONFIRMED,
            id: { not: appointmentId },
          },
        });
        for (const other of confirmed) {
          if (
            rangesOverlap(
              appt.startsAt,
              appt.endsAt,
              other.startsAt,
              other.endsAt,
            )
          ) {
            throw new BadRequestException(
              'Another confirmed appointment overlaps this time slot',
            );
          }
        }
      }

      return this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: next },
        include: this.appointmentInclude(),
      });
    }

    throw new ForbiddenException('Invalid role');
  }
}
