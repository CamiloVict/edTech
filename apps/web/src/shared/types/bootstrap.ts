export type UserRole = 'CONSUMER' | 'PROVIDER';

export type OnboardingStep = 'PENDING_ROLE' | 'PENDING_PROFILE' | 'COMPLETED';

export type ServiceMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export type ProviderKind = 'TEACHER' | 'BABYSITTER';

export type BootstrapChild = {
  id: string;
  firstName: string;
  birthDate: string;
  interests: string | null;
  notes: string | null;
};

export type BootstrapConsumerProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  relationshipToChild: string | null;
  isProfileCompleted: boolean;
  /** Customer Stripe creado al preparar método de pago. */
  hasStripeCustomer: boolean;
  children: BootstrapChild[];
};

export type BootstrapProviderProfile = {
  id: string;
  fullName: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  focusAreas: string[];
  serviceMode: ServiceMode | null;
  city: string | null;
  isProfileCompleted: boolean;
  photoUrl: string | null;
  averageRating: number;
  ratingCount: number;
  isAvailable: boolean;
  availabilitySummary: string | null;
  kinds: ProviderKind[];
  stripeConnectAccountId: string | null;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  needsStripeConnect: boolean;
};

export type BootstrapPayload = {
  user: {
    id: string;
    email: string;
    role: UserRole | null;
    onboardingStep: OnboardingStep;
    clerkUserId: string;
    createdAt: string;
    updatedAt: string;
  };
  needsRoleSelection: boolean;
  needsOnboarding: boolean;
  consumerProfile: BootstrapConsumerProfile | null;
  providerProfile: BootstrapProviderProfile | null;
};

export type SyncResponse = {
  user: BootstrapPayload['user'];
  bootstrap: BootstrapPayload;
};
