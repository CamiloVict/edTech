import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @IsISO8601()
  birthDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  interests?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
