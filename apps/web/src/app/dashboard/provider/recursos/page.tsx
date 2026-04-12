'use client';

import { MOCK_RESOURCES } from '@/features/educator-hub/data/educator-hub.mocks';
import { EducatorResourcesPage } from '@/features/educator-hub/presentation/views/educator-resources-page';

export default function ProviderResourcesRoute() {
  return <EducatorResourcesPage resources={MOCK_RESOURCES} />;
}
