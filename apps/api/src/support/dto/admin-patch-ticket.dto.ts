import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  SupportResolutionKind,
  SupportTicketStatus,
} from '@repo/database';

export class AdminPatchTicketDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsEnum(SupportResolutionKind)
  resolutionKind?: SupportResolutionKind;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  internalNote?: string;
}
