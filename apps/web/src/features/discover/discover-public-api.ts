import { publicApiRequest } from '@/shared/lib/api';
import type { ProviderKind, ServiceMode } from '@/shared/types/bootstrap';

/** Respuesta de `GET /discover/providers/:id` (pública). */
export type PublicEducatorProfile = {
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
};

export function getPublicEducatorProfile(providerProfileId: string) {
  return publicApiRequest<PublicEducatorProfile>(
    `/discover/providers/${providerProfileId}`,
  );
}
