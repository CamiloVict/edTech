import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { ProviderOfferStatus, ProviderOfferType, ServiceMode } from '@repo/database';

const AGE_BANDS = new Set(['0_3', '4_7', '8_12', '13_18']);

function isAgeBand(v: unknown): v is string {
  return typeof v === 'string' && AGE_BANDS.has(v);
}

export class CreateProviderOfferDto {
  @IsEnum(ProviderOfferType)
  type!: ProviderOfferType;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  description!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  ageBands?: string[];

  @IsEnum(ServiceMode)
  modality!: ServiceMode;

  @IsInt()
  @Min(15)
  @Max(24 * 60)
  durationMinutes!: number;

  @IsInt()
  @Min(0)
  priceMinor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  methodologyNote?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  suggestedFrequency!: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(1)
  @Max(500)
  maxSeats?: number | null;

  @IsEnum(ProviderOfferStatus)
  status!: ProviderOfferStatus;

  static normalizeAgeBands(raw: string[] | undefined): string[] {
    if (!raw?.length) return [];
    return raw.filter(isAgeBand);
  }
}

export class PatchProviderOfferDto {
  @IsOptional()
  @IsEnum(ProviderOfferType)
  type?: ProviderOfferType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  ageBands?: string[];

  @IsOptional()
  @IsEnum(ServiceMode)
  modality?: ServiceMode;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(24 * 60)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceMinor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  methodologyNote?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  suggestedFrequency?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(1)
  @Max(500)
  maxSeats?: number | null;

  @IsOptional()
  @IsEnum(ProviderOfferStatus)
  status?: ProviderOfferStatus;
}
