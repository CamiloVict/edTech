import { ProviderKind, ServiceMode } from '@repo/database';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProviderProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  focusAreas?: string[];

  @IsOptional()
  @IsEnum(ServiceMode)
  serviceMode?: ServiceMode;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  availabilitySummary?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsEnum(ProviderKind, { each: true })
  kinds?: ProviderKind[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
