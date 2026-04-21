import { IsBoolean, IsOptional } from 'class-validator';

export class ResolveTicketDto {
  /** Si hay propuesta automática, el usuario la acepta y se marca resuelto. */
  @IsOptional()
  @IsBoolean()
  acceptProposed?: boolean;
}
