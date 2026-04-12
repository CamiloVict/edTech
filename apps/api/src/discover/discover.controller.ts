import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProviderKind } from '@repo/database';

import { Public } from '../auth/public.decorator';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  /** Listado público para el inicio (familias exploran sin sesión). */
  @Public()
  @Get('providers')
  list(@Query('kind') kind?: string) {
    const normalized =
      kind === ProviderKind.TEACHER || kind === ProviderKind.BABYSITTER
        ? kind
        : undefined;
    return this.discover.listAvailable(normalized);
  }

  /** Perfil público del educador (página de ficha). */
  @Public()
  @Get('providers/:providerProfileId')
  getOne(@Param('providerProfileId') providerProfileId: string) {
    return this.discover.getPublicProfile(providerProfileId);
  }
}
