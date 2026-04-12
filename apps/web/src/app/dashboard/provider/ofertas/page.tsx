'use client';

import { MOCK_OFFERS } from '@/features/educator-hub/data/educator-hub.mocks';
import { EducatorOffersPage } from '@/features/educator-hub/presentation/views/educator-offers-page';

export default function ProviderOffersRoute() {
  return <EducatorOffersPage offers={MOCK_OFFERS} />;
}
