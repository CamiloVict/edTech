/**
 * Modelos del hub del educador — alineados con futuras tablas Prisma.
 * Prefijos: entidades de negocio del profesional en la plataforma.
 */

export type ServiceMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export type EducatorSpecialty = {
  id: string;
  label: string;
  categoryId: string;
};

export type AgeBand = '0_3' | '4_7' | '8_12' | '13_18';

export type EducatorProfile = {
  id: string;
  clerkUserId: string;
  fullName: string;
  headline: string;
  email: string;
  photoUrl: string | null;
  /** Bio corta (hero) */
  bioShort: string;
  /** Bio larga (sección detalle) */
  bioLong: string;
  yearsOfExperience: number;
  serviceMode: ServiceMode;
  city: string | null;
  zones: string[];
  focusAreas: string[];
  categories: string[];
  ageBands: AgeBand[];
  methodology: string;
  languages: string[];
  certifications: string[];
  averageRating: number;
  ratingCount: number;
  isAvailable: boolean;
  availabilitySummary: string;
  /** Precio orientativo menor (céntimos) para vitrina */
  priceFromMinor: number;
  currency: string;
  videoPresentationUrl: string | null;
  galleryUrls: string[];
  createdAt: string;
};

export type EducatorAvailabilityBlock = {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isAllDay: boolean;
  /** Modalidad preferida en ese bloque (mock) */
  modeHint?: ServiceMode;
};

/** Alineado con `AppointmentStatus` del API. */
export type EducatorAppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED_BY_FAMILY'
  | 'CANCELLED_BY_PROVIDER'
  | 'COMPLETED';

/** @deprecated Usa `EducatorAppointmentStatus`. */
export type SessionStatus = EducatorAppointmentStatus;

export type EducatorSession = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: EducatorAppointmentStatus;
  studentName: string;
  familyName: string;
  childName: string;
  modality: ServiceMode;
  offerTitle: string;
  notes?: string;
  /** Copiado de la cita para mostrar aviso en el panel. */
  requestsAlternativeSchedule?: boolean;
};

export type EducatorLead = {
  id: string;
  familyName: string;
  message: string;
  createdAt: string;
  status: 'NEW' | 'VIEWED' | 'REPLIED';
  interestedIn: string;
};

export type FamilyRelationship = 'MOTHER' | 'FATHER' | 'TUTOR' | 'OTHER';

export type EducatorStudent = {
  id: string;
  childFirstName: string;
  childAgeYears: number;
  birthYear: number;
  developmentStageLabel: string;
  familyName: string;
  contactEmail: string;
  relationship: FamilyRelationship;
  learningGoals: string[];
  interests: string[];
  active: boolean;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  sessionsCount: number;
  privateNotes: string;
  progressSummary: string;
  roadmapId: string | null;
};

export type OfferType =
  | 'ONE_TO_ONE'
  | 'WORKSHOP'
  | 'MINI_COURSE'
  | 'AGE_PROGRAM'
  | 'LEARNING_PATH'
  | 'EXPERIENCE'
  /** Libre: el educador define título y descripción sin encajar en otra plantilla. */
  | 'CUSTOM';

export type OfferStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED';

export type EducatorOffer = {
  id: string;
  type: OfferType;
  title: string;
  category: string;
  description: string;
  ageBands: AgeBand[];
  modality: ServiceMode;
  durationMinutes: number;
  priceMinor: number;
  currency: string;
  objectives: string[];
  methodologyNote: string;
  suggestedFrequency: string;
  maxSeats: number | null;
  status: OfferStatus;
  bookingsCount: number;
  viewsCount: number;
};

export type EducatorMetric = {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
};

export type EducatorInsight = {
  id: string;
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  category: 'CONVERSION' | 'DEMAND' | 'PROFILE' | 'RETENTION';
};

export type EducatorBadge = {
  id: string;
  label: string;
  description: string;
  icon: 'star' | 'leaf' | 'bolt' | 'heart' | 'check';
  earned: boolean;
};

export type EducatorReview = {
  id: string;
  authorName: string;
  rating: number;
  excerpt: string;
  date: string;
  offerTitle?: string;
};

/** Valoración que el educador dejó a una familia tras una cita completada (solo vista educador). */
export type EducatorReviewOfFamily = {
  id: string;
  familyDisplayName: string;
  rating: number;
  excerpt: string;
  date: string;
  sessionHint?: string;
};

export type RoadmapBlockStatus = 'SUGGESTED' | 'ACTIVE' | 'DONE' | 'ADJUSTED';

export type StudentRoadmapBlock = {
  id: string;
  title: string;
  rationale: string;
  status: RoadmapBlockStatus;
  source: 'PLATFORM' | 'EDUCATOR' | 'FAMILY';
  updatedAt: string;
};

export type StudentRoadmapSummary = {
  studentId: string;
  planTitle: string;
  categoryLabel: string;
  blocks: StudentRoadmapBlock[];
  educatorNotes: string;
  lastCollaborationAt: string;
};

export type EducatorResourceType =
  | 'GUIDE'
  | 'ACTIVITY'
  | 'DEVELOPMENT'
  | 'TEMPLATE'
  | 'SEQUENCE'
  | 'TIP'
  | 'BEST_PRACTICE';

export type EducatorResource = {
  id: string;
  type: EducatorResourceType;
  title: string;
  excerpt: string;
  categoryTags: string[];
  ageBands: AgeBand[];
  readMinutes: number;
  saved: boolean;
};

export type ProfileCompletionItem = {
  id: string;
  label: string;
  done: boolean;
  impactLabel: string;
};

export type EducatorDashboardSnapshot = {
  profile: EducatorProfile;
  kpis: {
    revenueMonthMinor: number;
    sessionsThisWeek: number;
    newLeads: number;
    profileViewsToBookingRate: number;
    openHoursWeek: number;
    avgRating: number;
    retentionRate: number;
  };
  upcomingSessions: EducatorSession[];
  leads: EducatorLead[];
  activeStudents: EducatorStudent[];
  topOffers: { offerId: string; title: string; bookings: number }[];
  recentReviews: EducatorReview[];
  /** Valoraciones que tú escribiste sobre familias (citas completadas). */
  reviewsLeftForFamilies: EducatorReviewOfFamily[];
  insights: EducatorInsight[];
  badges: EducatorBadge[];
  profileCompletion: {
    scorePercent: number;
    items: ProfileCompletionItem[];
  };
};
