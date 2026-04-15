import { Body, Controller, Get, Post } from '@nestjs/common';

import { CurrentClerkUser } from '../auth/current-clerk-user.decorator';
import { SetRoleDto } from './dto/set-role.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Crea o actualiza el usuario interno a partir del JWT de Clerk. */
  @Post('sync')
  async sync(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    // #region agent log
    fetch('http://127.0.0.1:7579/ingest/2ee12556-a4f1-4036-a88c-e234ea492cc1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'edb330',
      },
      body: JSON.stringify({
        sessionId: 'edb330',
        runId: 'pre-fix-v2',
        hypothesisId: 'H4',
        location: 'users.controller.ts:sync-entry',
        message: 'users/sync reached',
        data: { clerkUserIdLen: clerk.clerkUserId.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const user = await this.users.syncFromClerk(clerk.clerkUserId);
    const bootstrap = await this.users.getBootstrap(clerk.clerkUserId);
    return { user, bootstrap };
  }

  @Get('me')
  async me(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.users.findByClerkOrThrow(clerk.clerkUserId);
  }

  @Get('bootstrap')
  async bootstrap(@CurrentClerkUser() clerk: { clerkUserId: string }) {
    return this.users.getBootstrap(clerk.clerkUserId);
  }

  @Post('role')
  async setRole(
    @CurrentClerkUser() clerk: { clerkUserId: string },
    @Body() dto: SetRoleDto,
  ) {
    await this.users.setRole(clerk.clerkUserId, dto.role);
    return this.users.getBootstrap(clerk.clerkUserId);
  }
}
