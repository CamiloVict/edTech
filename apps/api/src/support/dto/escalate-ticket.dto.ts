import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EscalateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
