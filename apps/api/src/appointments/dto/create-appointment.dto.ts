import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

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
}
