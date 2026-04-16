import { DwellingType } from '@repo/database';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateConsumerProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relationshipToChild?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(240)
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  unitOrBuilding?: string;

  @IsOptional()
  @IsEnum(DwellingType)
  dwellingType?: DwellingType;
}
