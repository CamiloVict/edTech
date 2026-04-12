import { apiRequest } from '@/shared/lib/api';

export type AvailabilityBlockRow = {
  id: string;
  providerProfileId: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export function listMyAvailabilityBlocks(
  getToken: () => Promise<string | null>,
) {
  return apiRequest<AvailabilityBlockRow[]>('/availability/me/blocks', {
    getToken,
  });
}

export function createAvailabilityBlock(
  getToken: () => Promise<string | null>,
  body: {
    startsAt: string;
    endsAt: string;
    isAllDay?: boolean;
    timezone?: string;
  },
) {
  return apiRequest<AvailabilityBlockRow>('/availability/me/blocks', {
    method: 'POST',
    body,
    getToken,
  });
}

export function updateAvailabilityBlock(
  getToken: () => Promise<string | null>,
  blockId: string,
  body: Partial<{
    startsAt: string;
    endsAt: string;
    isAllDay: boolean;
    timezone: string;
  }>,
) {
  return apiRequest<AvailabilityBlockRow>(`/availability/me/blocks/${blockId}`, {
    method: 'PATCH',
    body,
    getToken,
  });
}

export function deleteAvailabilityBlock(
  getToken: () => Promise<string | null>,
  blockId: string,
) {
  return apiRequest<{ deleted: boolean }>(
    `/availability/me/blocks/${blockId}`,
    {
      method: 'DELETE',
      getToken,
    },
  );
}
