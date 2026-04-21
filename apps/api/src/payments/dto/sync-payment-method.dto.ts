import { IsString, MinLength } from 'class-validator';

export class SyncPaymentMethodDto {
  @IsString()
  @MinLength(5)
  paymentMethodId!: string;
}
