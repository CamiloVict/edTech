'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';

import { buildEducatorDashboardSnapshot } from '@/features/educator-hub/application/build-dashboard-snapshot';
import { MOCK_BADGES, MOCK_EDUCATOR_PROFILE, MOCK_REVIEWS } from '@/features/educator-hub/data/educator-hub.mocks';
import type { EducatorProfile } from '@/features/educator-hub/domain/types';
import { EducatorVitrinaPage } from '@/features/educator-hub/presentation/views/educator-vitrina-page';
import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import { getProviderProfile } from '@/features/provider/api/provider-api';

export default function ProviderVitrinaRoute() {
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

  const completion = useMemo(() => buildEducatorDashboardSnapshot().profileCompletion, []);

  const vitrinaProfile: EducatorProfile = useMemo(() => {
    const api = profileQuery.data;
    return {
      ...MOCK_EDUCATOR_PROFILE,
      id: api?.id ?? MOCK_EDUCATOR_PROFILE.id,
      clerkUserId: api?.userId ?? MOCK_EDUCATOR_PROFILE.clerkUserId,
      fullName: api?.fullName?.trim() || MOCK_EDUCATOR_PROFILE.fullName,
      email: user?.primaryEmailAddress?.emailAddress ?? MOCK_EDUCATOR_PROFILE.email,
      photoUrl: api?.photoUrl ?? MOCK_EDUCATOR_PROFILE.photoUrl,
      bioShort: api?.bio?.trim() || MOCK_EDUCATOR_PROFILE.bioShort,
      bioLong: MOCK_EDUCATOR_PROFILE.bioLong,
      yearsOfExperience: api?.yearsOfExperience ?? MOCK_EDUCATOR_PROFILE.yearsOfExperience,
      serviceMode: api?.serviceMode ?? MOCK_EDUCATOR_PROFILE.serviceMode,
      city: api?.city ?? MOCK_EDUCATOR_PROFILE.city,
      focusAreas: api?.focusAreas?.length ? api.focusAreas : MOCK_EDUCATOR_PROFILE.focusAreas,
      methodology: MOCK_EDUCATOR_PROFILE.methodology,
      isAvailable: api?.isAvailable ?? MOCK_EDUCATOR_PROFILE.isAvailable,
      availabilitySummary:
        api?.availabilitySummary ?? MOCK_EDUCATOR_PROFILE.availabilitySummary,
      averageRating: api?.averageRating ?? MOCK_EDUCATOR_PROFILE.averageRating,
      ratingCount: api?.ratingCount ?? MOCK_EDUCATOR_PROFILE.ratingCount,
    };
  }, [profileQuery.data, user]);

  if (bootstrapQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted-foreground)]">
        Cargando vitrina…
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
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
      reviews={MOCK_REVIEWS}
      badges={MOCK_BADGES}
      completion={completion}
      publicProfileId={profileQuery.data.id}
    />
  );
}
