import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class TicketMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
