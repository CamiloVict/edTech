import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAvailabilityBlockDto {
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(2)
  timezone?: string;
}
