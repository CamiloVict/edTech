'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';

import { buildEducatorDashboardSnapshot } from '@/features/educator-hub/application/build-dashboard-snapshot';
import { EducatorDashboardHome } from '@/features/educator-hub/presentation/views/educator-dashboard-home';
import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import { getProviderProfile } from '@/features/provider/api/provider-api';

export default function ProviderDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getProviderProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'PROVIDER',
  });

  const snapshot = useMemo(() => buildEducatorDashboardSnapshot(), []);

  const displayName = useMemo(() => {
    const p = profileQuery.data;
    return (
      p?.fullName ||
      user?.firstName ||
      user?.primaryEmailAddress?.emailAddress ||
      'Educador'
    );
  }, [profileQuery.data, user]);

  if (bootstrapQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-[var(--muted-foreground)]">
        Cargando tu panel…
      </div>
    );
  }

  if (bootstrapQuery.isError || profileQuery.isError || !profileQuery.data) {
    return (
      <div className="p-8 text-base text-red-700">
        No se pudo cargar tu tablero.{' '}
        <Link href="/mi-espacio" className="font-semibold underline">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <EducatorDashboardHome
      snapshot={snapshot}
      displayName={displayName}
      publicProfileId={profileQuery.data.id}
    />
  );
}
