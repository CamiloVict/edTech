import { apiRequest } from '@/shared/lib/api';

import type { SupportTicketRow } from './support-api';

export function listAdminSupportTickets(
  getToken: () => Promise<string | null>,
  query?: { status?: string; categoryCode?: string; providerProfileId?: string },
) {
  const sp = new URLSearchParams();
  if (query?.status) sp.set('status', query.status);
  if (query?.categoryCode) sp.set('categoryCode', query.categoryCode);
  if (query?.providerProfileId) sp.set('providerProfileId', query.providerProfileId);
  const q = sp.toString();
  return apiRequest<SupportTicketRow[]>(`/admin/support/tickets${q ? `?${q}` : ''}`, {
    getToken,
  });
}

export function getAdminSupportMetrics(getToken: () => Promise<string | null>) {
  return apiRequest<{
    totalTickets: number;
    resolvedCount: number;
    escalatedCount: number;
    autoResolvedCount: number;
    manualResolvedApprox: number;
    complaintRateByCategory: { categoryCode: string; count: number }[];
    topEducatorsByTicketVolume: {
      providerProfileId: string;
      ticketCount: number;
    }[];
  }>('/admin/support/metrics', { getToken });
}
