import { IsUrl } from 'class-validator';

export class CreateConnectOnboardingLinkDto {
  @IsUrl({ require_tld: false })
  refreshUrl!: string;

  @IsUrl({ require_tld: false })
  returnUrl!: string;
}
