import type {
  DiscoverProvider,
  ProviderKind,
} from '@/features/discover/types';

export async function fetchDiscoverProviders(
  kind?: ProviderKind | '',
): Promise<DiscoverProvider[]> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return [];
  }

  const url = new URL(`${base.replace(/\/$/, '')}/v1/discover/providers`);
  if (kind === 'TEACHER' || kind === 'BABYSITTER') {
    url.searchParams.set('kind', kind);
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as DiscoverProvider[];
  } catch {
    return [];
  }
}
