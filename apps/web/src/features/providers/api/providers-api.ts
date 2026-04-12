import { apiRequest } from '@/shared/lib/api';
import type { ProviderKind, ServiceMode } from '@/shared/types/bootstrap';

export type RateUnit = 'HOUR' | 'SESSION' | 'DAY';

export type ProviderRateRow = {
  id: string;
  label: string | null;
  amountMinor: number;
  currency: string;
  unit: RateUnit;
  sortOrder: number;
};

export type ProviderAvailabilityBlockRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezone: string;
};

export type ProviderDetailResponse = {
  id: string;
  fullName: string | null;
  bio: string | null;
  photoUrl: string | null;
  averageRating: number;
  ratingCount: number;
  availabilitySummary: string | null;
  kinds: ProviderKind[];
  city: string | null;
  yearsOfExperience: number | null;
  focusAreas: string[];
  serviceMode: ServiceMode | null;
  rates: ProviderRateRow[];
  availabilityBlocks: ProviderAvailabilityBlockRow[];
};

export function getProviderDetail(
  getToken: () => Promise<string | null>,
  providerProfileId: string,
) {
  return apiRequest<ProviderDetailResponse>(
    `/providers/${providerProfileId}`,
    { getToken },
  );
}
