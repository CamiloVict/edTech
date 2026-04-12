'use client';

import { buildEducatorInsightsMetrics } from '@/features/educator-hub/application/insights-metrics.mock';
import { MOCK_BADGES, MOCK_INSIGHTS } from '@/features/educator-hub/data/educator-hub.mocks';
import { EducatorInsightsPage } from '@/features/educator-hub/presentation/views/educator-insights-page';

export default function ProviderInsightsRoute() {
  const metrics = buildEducatorInsightsMetrics();
  return (
    <EducatorInsightsPage metrics={metrics} insights={MOCK_INSIGHTS} badges={MOCK_BADGES} />
  );
}
