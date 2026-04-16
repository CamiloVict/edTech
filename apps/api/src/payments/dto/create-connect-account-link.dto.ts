import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreateConnectAccountLinkDto {
  @IsUrl({ require_tld: false })
  @IsString()
  @MinLength(8)
  returnUrl!: string;

  @IsUrl({ require_tld: false })
  @IsString()
  @MinLength(8)
  refreshUrl!: string;
}
