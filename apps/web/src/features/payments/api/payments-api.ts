import { apiRequest } from '@/shared/lib/api';

type GetToken = () => Promise<string | null>;

export type SavedPaymentMethod = {
  id: string;
  stripePaymentMethodId: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
};

export type ProviderConnectStatus = {
  connected: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
};

export async function createSetupIntent(getToken: GetToken) {
  return apiRequest<{ clientSecret: string | null; customerId: string }>(
    '/payments/me/setup-intent',
    {
      method: 'POST',
      getToken,
    },
  );
}

export async function listMyPaymentMethods(getToken: GetToken) {
  return apiRequest<SavedPaymentMethod[]>('/payments/me/payment-methods', {
    getToken,
  });
}

export async function syncPaymentMethod(getToken: GetToken, paymentMethodId: string) {
  return apiRequest<SavedPaymentMethod>('/payments/me/payment-methods/sync', {
    method: 'POST',
    body: { paymentMethodId },
    getToken,
  });
}

export async function setDefaultPaymentMethod(getToken: GetToken, paymentMethodId: string) {
  return apiRequest<{ ok: true }>('/payments/me/payment-methods/default', {
    method: 'PATCH',
    body: { paymentMethodId },
    getToken,
  });
}

export async function deletePaymentMethod(getToken: GetToken, paymentMethodId: string) {
  return apiRequest<{ ok: true }>(`/payments/me/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
    getToken,
  });
}

export async function getProviderConnectStatus(getToken: GetToken) {
  return apiRequest<ProviderConnectStatus>('/payments/provider/connect/status', {
    getToken,
  });
}

export async function createProviderOnboardingLink(
  getToken: GetToken,
  payload: { refreshUrl: string; returnUrl: string },
) {
  return apiRequest<{ url: string; expiresAt: number }>(
    '/payments/provider/connect/onboarding-link',
    {
      method: 'POST',
      body: payload,
      getToken,
    },
  );
}
