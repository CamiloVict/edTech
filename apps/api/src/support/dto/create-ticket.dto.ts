import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EvidenceItemDto {
  @IsString()
  @MinLength(8)
  @MaxLength(600000)
  fileUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class CreateTicketDto {
  @IsString()
  @MinLength(8)
  appointmentId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  categoryCode!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  formalComplaint?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  initialMessage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence?: EvidenceItemDto[];
}
