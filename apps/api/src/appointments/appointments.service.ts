import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentAttendance,
  AppointmentReviewAuthor,
  AppointmentStatus,
  InPersonVenueHost,
  Prisma,
  ProviderKind,
  ServiceMode,
  UserRole,
} from '@repo/database';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ALTERNATIVE_SCHEDULE_UTC_DAY_SPAN,
  utcMaxInstantForAlternativeRequest,
} from './custom-alternative-limits';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentReviewDto } from './dto/create-appointment-review.dto';
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

function isBabysitterOnlyKinds(kinds: ProviderKind[]): boolean {
  return kinds.length > 0 && kinds.every((k) => k === ProviderKind.BABYSITTER);
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
          serviceMode: true,
          kinds: true,
          streetAddress: true,
          postalCode: true,
          unitOrBuilding: true,
          dwellingType: true,
        },
      },
      consumerProfile: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          city: true,
          streetAddress: true,
          postalCode: true,
          unitOrBuilding: true,
          dwellingType: true,
        },
      },
      child: {
        select: { id: true, firstName: true },
      },
      reviews: {
        select: {
          authorRole: true,
          stars: true,
          comment: true,
        },
      },
    };
  }

  private logisticsUpdateFromDto(
    dto: PatchAppointmentDto,
  ): Prisma.AppointmentUpdateInput {
    const data: Prisma.AppointmentUpdateInput = {};
    if (dto.meetingUrl !== undefined) {
      const t = dto.meetingUrl.trim();
      data.meetingUrl = t.length > 0 ? t : null;
    }
    if (dto.inPersonVenueHost !== undefined) {
      data.inPersonVenueHost = dto.inPersonVenueHost;
    }
    if (dto.attendanceMode !== undefined) {
      data.attendanceMode = dto.attendanceMode;
    }
    return data;
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

    const sm = provider.serviceMode ?? ServiceMode.IN_PERSON;
    let attendance: AppointmentAttendance;
    if (sm === ServiceMode.IN_PERSON) {
      attendance = AppointmentAttendance.IN_PERSON;
    } else if (sm === ServiceMode.ONLINE) {
      attendance = AppointmentAttendance.ONLINE;
    } else {
      if (isBabysitterOnlyKinds(provider.kinds)) {
        attendance = AppointmentAttendance.IN_PERSON;
      } else if (!dto.attendanceMode) {
        throw new BadRequestException(
          'Indica si la sesión será presencial o en línea',
        );
      } else {
        attendance = dto.attendanceMode;
      }
    }

    const meetingTrim = dto.meetingUrl?.trim();
    const meetingUrl =
      attendance === AppointmentAttendance.ONLINE &&
      meetingTrim &&
      meetingTrim.length > 0
        ? meetingTrim
        : null;

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
        meetingUrl,
        attendanceMode: attendance,
        inPersonVenueHost: InPersonVenueHost.CONSUMER,
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
    const logistics = this.logisticsUpdateFromDto(dto);
    const hasLogistics = Object.keys(logistics).length > 0;
    const next = dto.status;

    if (user.role === UserRole.CONSUMER) {
      const profile = user.consumerProfile;
      if (!profile || appt.consumerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }

      if (next !== undefined && next !== AppointmentStatus.CANCELLED_BY_FAMILY) {
        throw new BadRequestException(
          'Las familias solo pueden cancelar la cita o actualizar enlace de reunión, modalidad (presencial/en línea) y lugar presencial.',
        );
      }

      if (next === AppointmentStatus.CANCELLED_BY_FAMILY) {
        if (
          appt.status !== AppointmentStatus.PENDING &&
          appt.status !== AppointmentStatus.CONFIRMED
        ) {
          throw new BadRequestException('This appointment cannot be cancelled');
        }
        return this.prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: AppointmentStatus.CANCELLED_BY_FAMILY,
            ...logistics,
          },
          include: this.appointmentInclude(),
        });
      }

      if (hasLogistics) {
        return this.prisma.appointment.update({
          where: { id: appointmentId },
          data: logistics,
          include: this.appointmentInclude(),
        });
      }

      throw new BadRequestException('Nada que actualizar');
    }

    if (user.role === UserRole.PROVIDER) {
      const profile = user.providerProfile;
      if (!profile || appt.providerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }

      if (next === undefined) {
        if (!hasLogistics) {
          throw new BadRequestException('Nada que actualizar');
        }
        return this.prisma.appointment.update({
          where: { id: appointmentId },
          data: logistics,
          include: this.appointmentInclude(),
        });
      }

      if (next === AppointmentStatus.COMPLETED) {
        if (appt.status !== AppointmentStatus.CONFIRMED) {
          throw new BadRequestException(
            'Solo se pueden marcar como completadas las citas confirmadas.',
          );
        }
        const now = new Date();
        if (appt.endsAt.getTime() > now.getTime()) {
          throw new BadRequestException(
            'Solo puedes marcar como completada la sesión cuando haya pasado la hora de fin.',
          );
        }
        return this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: AppointmentStatus.COMPLETED, ...logistics },
          include: this.appointmentInclude(),
        });
      }

      if (
        next !== AppointmentStatus.CONFIRMED &&
        next !== AppointmentStatus.DECLINED &&
        next !== AppointmentStatus.CANCELLED_BY_PROVIDER
      ) {
        throw new BadRequestException(
          'Estado no válido: como educador puedes confirmar, rechazar, cancelar o completar citas.',
        );
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
          data: {
            status: AppointmentStatus.CANCELLED_BY_PROVIDER,
            ...logistics,
          },
          include: this.appointmentInclude(),
        });
      }

      if (appt.status !== AppointmentStatus.PENDING && next === AppointmentStatus.CONFIRMED) {
        throw new BadRequestException(
          'Solo se pueden confirmar citas que siguen pendientes.',
        );
      }
      if (appt.status !== AppointmentStatus.PENDING && next === AppointmentStatus.DECLINED) {
        throw new BadRequestException(
          'Solo se pueden rechazar citas que siguen pendientes.',
        );
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
              'Ya tienes otra cita confirmada que se solapa con este horario. Cancela o reprograma la otra antes de confirmar esta.',
            );
          }
        }
      }

      return this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: next, ...logistics },
        include: this.appointmentInclude(),
      });
    }

    throw new ForbiddenException(
      'Tu cuenta no tiene un rol que pueda modificar esta cita (se requiere familia o educador).',
    );
  }

  async submitReview(
    clerkUserId: string,
    appointmentId: string,
    dto: CreateAppointmentReviewDto,
  ) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { reviews: true },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }
    if (appt.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Solo puedes valorar citas ya marcadas como completadas.',
      );
    }

    const user = await this.users.findByClerkOrThrow(clerkUserId);
    let authorRole: AppointmentReviewAuthor;
    if (user.role === UserRole.CONSUMER) {
      const profile = user.consumerProfile;
      if (!profile || appt.consumerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }
      authorRole = AppointmentReviewAuthor.CONSUMER;
    } else if (user.role === UserRole.PROVIDER) {
      const profile = user.providerProfile;
      if (!profile || appt.providerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }
      authorRole = AppointmentReviewAuthor.PROVIDER;
    } else {
      throw new ForbiddenException('Rol no válido');
    }

    if (appt.reviews.some((r) => r.authorRole === authorRole)) {
      throw new BadRequestException('Ya enviaste tu valoración para esta cita.');
    }

    const commentTrim = dto.comment?.trim() ?? '';
    const comment = commentTrim.length > 0 ? commentTrim : null;

    return this.prisma.$transaction(async (tx) => {
      await tx.appointmentReview.create({
        data: {
          appointmentId,
          authorRole,
          stars: dto.stars,
          comment,
        },
      });
      if (authorRole === AppointmentReviewAuthor.CONSUMER) {
        await this.recalcProviderRatingFromConsumerReviews(
          tx,
          appt.providerProfileId,
        );
      }
      return tx.appointment.findUniqueOrThrow({
        where: { id: appointmentId },
        include: this.appointmentInclude(),
      });
    });
  }

  private async recalcProviderRatingFromConsumerReviews(
    tx: Prisma.TransactionClient,
    providerProfileId: string,
  ) {
    const agg = await tx.appointmentReview.aggregate({
      where: {
        authorRole: AppointmentReviewAuthor.CONSUMER,
        appointment: { providerProfileId },
      },
      _avg: { stars: true },
      _count: { _all: true },
    });
    const count = agg._count._all;
    const avgStars =
      count === 0 || agg._avg.stars == null ? 0 : Number(agg._avg.stars);
    const clamped = Math.min(5, Math.max(0, avgStars));
    await tx.providerProfile.update({
      where: { id: providerProfileId },
      data: {
        averageRating: new Prisma.Decimal(clamped.toFixed(2)),
        ratingCount: count,
      },
    });
  }

  async dismissReviewPrompt(clerkUserId: string, appointmentId: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { reviews: true },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }
    if (appt.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Acción no aplicable a esta cita.');
    }

    const user = await this.users.findByClerkOrThrow(clerkUserId);
    if (user.role === UserRole.CONSUMER) {
      const profile = user.consumerProfile;
      if (!profile || appt.consumerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }
      if (
        appt.reviews.some((r) => r.authorRole === AppointmentReviewAuthor.CONSUMER)
      ) {
        return this.prisma.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: this.appointmentInclude(),
        });
      }
      if (appt.consumerReviewPromptDismissals >= 2) {
        return this.prisma.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: this.appointmentInclude(),
        });
      }
      return this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          consumerReviewPromptDismissals: { increment: 1 },
        },
        include: this.appointmentInclude(),
      });
    }

    if (user.role === UserRole.PROVIDER) {
      const profile = user.providerProfile;
      if (!profile || appt.providerProfileId !== profile.id) {
        throw new ForbiddenException('Not your appointment');
      }
      if (
        appt.reviews.some((r) => r.authorRole === AppointmentReviewAuthor.PROVIDER)
      ) {
        return this.prisma.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: this.appointmentInclude(),
        });
      }
      if (appt.providerReviewPromptDismissals >= 2) {
        return this.prisma.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: this.appointmentInclude(),
        });
      }
      return this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          providerReviewPromptDismissals: { increment: 1 },
        },
        include: this.appointmentInclude(),
      });
    }

    throw new ForbiddenException('Rol no válido');
  }
}
