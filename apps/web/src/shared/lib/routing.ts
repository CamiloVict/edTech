import type { BootstrapPayload } from '@/shared/types/bootstrap';

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
