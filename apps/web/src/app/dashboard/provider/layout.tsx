import type { ReactNode } from 'react';

import { EducatorHubShell } from '@/features/educator-hub/presentation/educator-hub-shell';

export default function ProviderDashboardLayout({ children }: { children: ReactNode }) {
  return <EducatorHubShell>{children}</EducatorHubShell>;
}
