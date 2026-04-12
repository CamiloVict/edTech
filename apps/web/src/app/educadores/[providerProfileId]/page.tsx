import type { Metadata } from 'next';

import { EducatorProfilePage } from '@/features/educadores/educator-profile-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ providerProfileId: string }>;
}): Promise<Metadata> {
  const { providerProfileId } = await params;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base) {
    return { title: 'Educador | Edify' };
  }
  try {
    const res = await fetch(
      `${base}/v1/discover/providers/${providerProfileId}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) {
      return { title: 'Educador | Edify' };
    }
    const p = (await res.json()) as {
      fullName?: string | null;
      bio?: string | null;
      city?: string | null;
    };
    const name = p.fullName?.trim() || 'Educador';
    const desc = [p.bio, p.city].filter(Boolean).join(' · ').slice(0, 160);
    return {
      title: `${name} | Edify`,
      description: desc || `Perfil de ${name} en Edify.`,
    };
  } catch {
    return { title: 'Educador | Edify' };
  }
}

export default async function EducadorProfileRoute({
  params,
}: {
  params: Promise<{ providerProfileId: string }>;
}) {
  const { providerProfileId } = await params;
  return <EducatorProfilePage providerProfileId={providerProfileId} />;
}
