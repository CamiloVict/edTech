import type { BootstrapPayload } from '@/shared/types/bootstrap';

/** Hub interno según rol (p. ej. validar si el usuario debe estar en un dashboard). */
export function pathAfterBootstrap(b: BootstrapPayload): string {
  if (b.needsRoleSelection) {
    return '/role';
  }
  if (!b.needsOnboarding) {
    return b.user.role === 'CONSUMER'
      ? '/dashboard/consumer'
      : '/dashboard/provider';
  }
  return b.user.role === 'CONSUMER'
    ? '/onboarding/consumer'
    : '/onboarding/provider';
}

/**
 * Primera pantalla tras login o al terminar el onboarding.
 * Familias van al catálogo; educadores al panel (no deben usar /explorar).
 */
export function landingPathAfterBootstrap(b: BootstrapPayload): string {
  if (b.needsRoleSelection) {
    return '/role';
  }
  if (!b.needsOnboarding) {
    return b.user.role === 'PROVIDER' ? '/dashboard/provider' : '/explorar';
  }
  return b.user.role === 'CONSUMER'
    ? '/onboarding/consumer'
    : '/onboarding/provider';
}
