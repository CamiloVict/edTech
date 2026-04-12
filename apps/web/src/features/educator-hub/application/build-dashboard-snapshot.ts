import type { EducatorDashboardSnapshot } from '../domain/types';
import {
  MOCK_BADGES,
  MOCK_EDUCATOR_PROFILE,
  MOCK_INSIGHTS,
  MOCK_LEADS,
  MOCK_OFFERS,
  MOCK_PROFILE_ITEMS,
  MOCK_REVIEWS,
  MOCK_STUDENTS,
  MOCK_UPCOMING_SESSIONS,
} from '../data/educator-hub.mocks';

/**
 * Agrega KPIs y listas a partir de mocks — sustituir por respuesta API.
 */
export function buildEducatorDashboardSnapshot(): EducatorDashboardSnapshot {
  const done = MOCK_PROFILE_ITEMS.filter((i) => i.done).length;
  const scorePercent = Math.round((done / MOCK_PROFILE_ITEMS.length) * 100);

  return {
    profile: MOCK_EDUCATOR_PROFILE,
    kpis: {
      revenueMonthMinor: 124_500,
      sessionsThisWeek: 7,
      newLeads: MOCK_LEADS.filter((l) => l.status === 'NEW').length,
      profileViewsToBookingRate: 0.034,
      openHoursWeek: 11.5,
      avgRating: MOCK_EDUCATOR_PROFILE.averageRating,
      retentionRate: 0.72,
    },
    upcomingSessions: MOCK_UPCOMING_SESSIONS,
    leads: MOCK_LEADS,
    activeStudents: MOCK_STUDENTS.filter((s) => s.active),
    topOffers: MOCK_OFFERS.filter((o) => o.status === 'PUBLISHED')
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 3)
      .map((o) => ({
        offerId: o.id,
        title: o.title,
        bookings: o.bookingsCount,
      })),
    recentReviews: MOCK_REVIEWS,
    insights: MOCK_INSIGHTS,
    badges: MOCK_BADGES,
    profileCompletion: {
      scorePercent,
      items: MOCK_PROFILE_ITEMS,
    },
  };
}
