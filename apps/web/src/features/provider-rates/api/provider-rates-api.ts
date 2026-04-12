import { apiRequest } from '@/shared/lib/api';
import type { RateUnit } from '@/features/providers/api/providers-api';

export type ProviderRateApiRow = {
  id: string;
  providerProfileId: string;
  label: string | null;
  amountMinor: number;
  currency: string;
  unit: RateUnit;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function listMyRates(getToken: () => Promise<string | null>) {
  return apiRequest<ProviderRateApiRow[]>('/provider-profiles/me/rates', {
    getToken,
  });
}

export function createRate(
  getToken: () => Promise<string | null>,
  body: {
    label?: string;
    amountMinor: number;
    currency?: string;
    unit: RateUnit;
    sortOrder?: number;
  },
) {
  return apiRequest<ProviderRateApiRow>('/provider-profiles/me/rates', {
    method: 'POST',
    body,
    getToken,
  });
}

export function updateRate(
  getToken: () => Promise<string | null>,
  rateId: string,
  body: Partial<{
    label: string | null;
    amountMinor: number;
    currency: string;
    unit: RateUnit;
    sortOrder: number;
  }>,
) {
  return apiRequest<ProviderRateApiRow>(
    `/provider-profiles/me/rates/${rateId}`,
    {
      method: 'PATCH',
      body,
      getToken,
    },
  );
}

export function deleteRate(
  getToken: () => Promise<string | null>,
  rateId: string,
) {
  return apiRequest<{ deleted: boolean }>(
    `/provider-profiles/me/rates/${rateId}`,
    {
      method: 'DELETE',
      getToken,
    },
  );
}
