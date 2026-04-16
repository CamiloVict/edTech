import { apiRequest } from '@/shared/lib/api';

export function createConsumerSetupIntent(getToken: () => Promise<string | null>) {
  return apiRequest<{
    clientSecret: string;
    stripePublishableKey: string;
  }>('/payments/consumer/setup-intent', {
    method: 'POST',
    getToken,
  });
}

export function completeConsumerSetupIntent(
  getToken: () => Promise<string | null>,
  setupIntentId: string,
) {
  return apiRequest<{ ok: true }>('/payments/consumer/complete-setup', {
    method: 'POST',
    body: { setupIntentId },
    getToken,
  });
}

export function getProviderStripeStatus(getToken: () => Promise<string | null>) {
  return apiRequest<{
    stripeConnectAccountId: string | null;
    stripeChargesEnabled: boolean;
    stripePayoutsEnabled: boolean;
    needsOnboarding: boolean;
  }>('/payments/provider/stripe-status', { getToken });
}

export function createProviderConnectAccountLink(
  getToken: () => Promise<string | null>,
  body: { returnUrl: string; refreshUrl: string },
) {
  return apiRequest<{ url: string }>('/payments/provider/connect-account-link', {
    method: 'POST',
    body,
    getToken,
  });
}
