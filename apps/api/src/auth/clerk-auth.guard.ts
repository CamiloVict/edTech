import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';

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

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new UnauthorizedException('Server auth not configured');
    }

    try {
      const payload = await verifyToken(token, { secretKey });
      const sub = typeof payload.sub === 'string' ? payload.sub : null;
      if (!sub) {
        throw new UnauthorizedException('Invalid token subject');
      }
      request.clerkUser = { clerkUserId: sub };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
