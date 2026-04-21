import { AppointmentAttendance } from '@repo/database';
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(1)
  providerProfileId!: string;

  @IsISO8601()
  startsAt!: string;

  @IsISO8601()
  endsAt!: string;

  /** Obligatorio: la cita queda ligada al hijo/a para quien se pide el servicio. */
  @IsString()
  @MinLength(1)
  childId!: string;

  @IsOptional()
  @IsString()
  noteFromFamily?: string;

  /** Si es true, no exigimos que el rango caiga dentro de un bloque de disponibilidad (petición especial). */
  @IsOptional()
  @IsBoolean()
  requestsAlternativeSchedule?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  meetingUrl?: string;

  /** Obligatorio si el educador es híbrido y no es solo cuidado/babysitting. */
  @IsOptional()
  @IsEnum(AppointmentAttendance)
  attendanceMode?: AppointmentAttendance;

  /** Opcional: si se envía, debe ser una oferta publicada de este educador. */
  @IsOptional()
  @IsString()
  @MinLength(1)
  providerOfferId?: string;
}
