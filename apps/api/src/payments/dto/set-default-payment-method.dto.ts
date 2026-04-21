import { IsString, MinLength } from 'class-validator';

export class SetDefaultPaymentMethodDto {
  @IsString()
  @MinLength(5)
  paymentMethodId!: string;
}
