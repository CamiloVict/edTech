import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Agentes de soporte = lista de `clerkUserId` en `SUPPORT_ADMIN_CLERK_IDS` (coma-separados).
 * En producción sustituir por roles en BD o Clerk org permissions.
 */
@Injectable()
export class SupportAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const raw = process.env.SUPPORT_ADMIN_CLERK_IDS?.trim();
    const allowed =
      raw?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    if (allowed.length === 0) {
      throw new ForbiddenException(
        'Soporte admin no configurado (SUPPORT_ADMIN_CLERK_IDS).',
      );
    }
    const req = context.switchToHttp().getRequest<{
      clerkUser?: { clerkUserId: string };
    }>();
    const clerkId = req.clerkUser?.clerkUserId;
    if (!clerkId || !allowed.includes(clerkId)) {
      throw new ForbiddenException('No tienes permiso de soporte admin.');
    }
    return true;
  }
}
