import { AppointmentStatus } from '@repo/database';
import { IsEnum } from 'class-validator';

export class PatchAppointmentDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;
}
