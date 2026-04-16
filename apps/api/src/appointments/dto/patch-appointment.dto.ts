import {
  AppointmentAttendance,
  AppointmentStatus,
  InPersonVenueHost,
} from '@repo/database';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  meetingUrl?: string;

  @IsOptional()
  @IsEnum(InPersonVenueHost)
  inPersonVenueHost?: InPersonVenueHost;

  @IsOptional()
  @IsEnum(AppointmentAttendance)
  attendanceMode?: AppointmentAttendance;
}
