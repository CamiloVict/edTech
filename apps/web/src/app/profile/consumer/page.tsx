import { permanentRedirect } from 'next/navigation';

import { consumerHubHref } from '@/features/consumer/lib/consumer-hub';

export default function ConsumerProfileRedirectPage() {
  permanentRedirect(consumerHubHref('familia'));
}
