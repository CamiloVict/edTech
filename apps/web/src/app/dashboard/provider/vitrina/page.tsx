'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';

import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import {
  buildProfileCompletionFromProvider,
  educatorProfileFromProvider,
} from '@/features/educator-hub/application/build-dashboard-snapshot';
import { EducatorVitrinaPage } from '@/features/educator-hub/presentation/views/educator-vitrina-page';
import { getProviderProfile } from '@/features/provider/api/provider-api';
import { listMyRates } from '@/features/provider-rates/api/provider-rates-api';

export default function ProviderVitrinaRoute() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const isProvider = bootstrapQuery.data?.user.role === 'PROVIDER';

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getProviderProfile(getToken),
    enabled: isProvider,
  });

  const ratesQuery = useQuery({
    queryKey: ['provider-rates', 'me'],
    queryFn: () => listMyRates(getToken),
    enabled: isProvider,
  });

  const vitrinaProfile = useMemo(() => {
    const api = profileQuery.data;
    if (!api) return null;
    return educatorProfileFromProvider(
      api,
      user?.primaryEmailAddress?.emailAddress?.trim() ?? '',
      ratesQuery.data ?? [],
    );
  }, [profileQuery.data, user, ratesQuery.data]);

  const completion = useMemo(() => {
    const api = profileQuery.data;
    if (!api) {
      return { scorePercent: 0, items: [] };
    }
    return buildProfileCompletionFromProvider(api);
  }, [profileQuery.data]);

  if (bootstrapQuery.isLoading || profileQuery.isLoading || ratesQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted-foreground)]">
        Cargando vitrina…
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data || !vitrinaProfile) {
    return (
      <div className="p-8 text-red-700">
        No se pudo cargar la vitrina.{' '}
        <Link href="/mi-espacio" className="font-semibold underline">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <EducatorVitrinaPage
      profile={vitrinaProfile}
      reviews={[]}
      badges={[]}
      completion={completion}
      publicProfileId={profileQuery.data.id}
    />
  );
}
