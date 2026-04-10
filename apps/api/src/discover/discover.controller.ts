import { Controller, Get, Query } from '@nestjs/common';
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
}
