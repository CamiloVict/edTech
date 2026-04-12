import { Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAvailabilityBlockDto {
  @IsISO8601()
  startsAt!: string;

  @IsISO8601()
  endsAt!: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(2)
  timezone?: string;
}
