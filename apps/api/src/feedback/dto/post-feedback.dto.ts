import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class PostFeedbackDto {
  @IsIn(['suggestion', 'complaint'])
  kind!: 'suggestion' | 'complaint';

  @IsString()
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres.' })
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @ValidateIf((_, v) => typeof v === 'string' && v.trim().length > 0)
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string;

  /** Ruta o URL de referencia (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  sourcePath?: string;

  /** Si el usuario está en sesión, el cliente puede enviar el id de Clerk (solo informativo). */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  clerkUserIdHint?: string;
}
