export type ProviderKind = 'TEACHER' | 'BABYSITTER';

export type DiscoverProvider = {
  id: string;
  fullName: string | null;
  bio: string | null;
  photoUrl: string | null;
  averageRating: number;
  ratingCount: number;
  availabilitySummary: string | null;
  kinds: ProviderKind[];
  city: string | null;
  yearsOfExperience: number | null;
  focusAreas: string[];
  serviceMode: string | null;
};
