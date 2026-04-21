import { apiRequest } from '@/shared/lib/api';

import type { EducatorOffer, OfferStatus, OfferType, ServiceMode } from '@/features/educator-hub/domain/types';

/** Respuesta de listado (incluye contadores derivados). */
export type ProviderOfferApiRow = EducatorOffer;

export function listMyProviderOffers(getToken: () => Promise<string | null>) {
  return apiRequest<ProviderOfferApiRow[]>('/provider-profiles/me/offers', {
    getToken,
  });
}

export type CreateProviderOfferBody = {
  type: OfferType;
  title: string;
  category?: string;
  description: string;
  ageBands?: string[];
  modality: ServiceMode;
  durationMinutes: number;
  priceMinor: number;
  currency?: string;
  objectives?: string[];
  methodologyNote?: string;
  suggestedFrequency: string;
  maxSeats?: number | null;
  status: OfferStatus;
};

export function createProviderOffer(
  getToken: () => Promise<string | null>,
  body: CreateProviderOfferBody,
) {
  return apiRequest<ProviderOfferApiRow>('/provider-profiles/me/offers', {
    method: 'POST',
    body,
    getToken,
  });
}

export type PatchProviderOfferBody = Partial<CreateProviderOfferBody>;

export function patchProviderOffer(
  getToken: () => Promise<string | null>,
  offerId: string,
  body: PatchProviderOfferBody,
) {
  return apiRequest<ProviderOfferApiRow>(`/provider-profiles/me/offers/${offerId}`, {
    method: 'PATCH',
    body,
    getToken,
  });
}
