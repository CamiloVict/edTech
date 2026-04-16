import { IsString, MinLength } from 'class-validator';

export class CompleteSetupIntentDto {
  @IsString()
  @MinLength(1)
  setupIntentId!: string;
}
