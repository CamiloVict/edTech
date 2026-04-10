import { apiRequest } from '@/shared/lib/api';
import type {
  BootstrapPayload,
  SyncResponse,
  UserRole,
} from '@/shared/types/bootstrap';

export const bootstrapQueryKey = ['bootstrap'] as const;

export function syncUser(getToken: () => Promise<string | null>) {
  return apiRequest<SyncResponse>('/users/sync', {
    method: 'POST',
    getToken,
  });
}

export function fetchBootstrap(getToken: () => Promise<string | null>) {
  return apiRequest<BootstrapPayload>('/users/bootstrap', { getToken });
}

export function setUserRole(
  getToken: () => Promise<string | null>,
  role: UserRole,
) {
  return apiRequest<BootstrapPayload>('/users/role', {
    method: 'POST',
    body: { role },
    getToken,
  });
}
