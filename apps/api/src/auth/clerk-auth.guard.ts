import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { TokenVerificationError } from '@clerk/backend/errors';

import { IS_PUBLIC_KEY } from './auth.constants';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      clerkUser?: { clerkUserId: string };
    }>();

    const header = request.headers.authorization;
    const token =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secretKey = process.env.CLERK_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new UnauthorizedException('Server auth not configured');
    }
    let tokenMeta: Record<string, unknown> = {};
    try {
      const payloadPart = token.split('.')[1] ?? '';
      const decoded = JSON.parse(
        Buffer.from(payloadPart, 'base64url').toString('utf8'),
      ) as { iss?: string; azp?: string; exp?: number; nbf?: number };
      tokenMeta = {
        issHost:
          typeof decoded.iss === 'string'
            ? decoded.iss.replace(/^https?:\/\//, '')
            : 'none',
        azp: typeof decoded.azp === 'string' ? decoded.azp : 'none',
        expInSec:
          typeof decoded.exp === 'number'
            ? decoded.exp - Math.floor(Date.now() / 1000)
            : null,
        nbfInSec:
          typeof decoded.nbf === 'number'
            ? decoded.nbf - Math.floor(Date.now() / 1000)
            : null,
      };
    } catch {
      tokenMeta = { parse: 'failed' };
    }
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
        hypothesisId: 'H2',
        location: 'clerk-auth.guard.ts:token-meta',
        message: 'guard token metadata',
        data: {
          tokenLen: token.length,
          secretPrefix: secretKey.startsWith('sk_test_')
            ? 'sk_test'
            : secretKey.startsWith('sk_live_')
              ? 'sk_live'
              : 'other',
          ...tokenMeta,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    try {
      const payload = await verifyToken(token, { secretKey });
      const sub = typeof payload.sub === 'string' ? payload.sub : null;
      if (!sub) {
        throw new UnauthorizedException('Invalid token subject');
      }
      request.clerkUser = { clerkUserId: sub };
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
          hypothesisId: 'H1',
          location: 'clerk-auth.guard.ts:verify-ok',
          message: 'verifyToken ok',
          data: { subLen: sub.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return true;
    } catch (err) {
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
          hypothesisId: 'H1',
          location: 'clerk-auth.guard.ts:verify-fail',
          message: 'verifyToken failed',
          data: {
            errName: err instanceof Error ? err.name : 'unknown',
            errMsg:
              err instanceof Error
                ? err.message.slice(0, 120)
                : String(err).slice(0, 120),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (err instanceof TokenVerificationError) {
        throw new UnauthorizedException(
          `Invalid or expired token (${err.reason}${err.action ? `; action=${err.action}` : ''})`,
        );
      }
      throw new UnauthorizedException(
        `Invalid or expired token (UNKNOWN:${err instanceof Error ? err.name : 'non-error'})`,
      );
    }
  }
}
