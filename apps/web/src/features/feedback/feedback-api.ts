import { publicApiRequest } from '@/shared/lib/api';

export type FeedbackKind = 'suggestion' | 'complaint';

export function postPublicFeedback(body: {
  kind: FeedbackKind;
  message: string;
  contactEmail?: string;
  sourcePath?: string;
  clerkUserIdHint?: string;
}) {
  return publicApiRequest<{ ok: true }>('/feedback', {
    method: 'POST',
    body,
  });
}
