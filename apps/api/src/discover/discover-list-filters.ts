import { ProviderKind, ServiceMode } from '@repo/database';

export type DiscoverListFilters = {
  kind?: ProviderKind;
  serviceMode?: ServiceMode;
  city?: string;
  minYearsExperience?: number;
  minRating?: number;
  minReviewCount?: number;
  /** Coincidencia en al menos una etiqueta de `focusAreas` (exacta). */
  focusTags?: string[];
  /** Texto libre en nombre, bio, ciudad o resumen de disponibilidad. */
  search?: string;
};

const MAX_FOCUS_TAGS = 12;
const MAX_CITY_LEN = 80;
const MAX_SEARCH_LEN = 160;

export function parseDiscoverListQuery(q: {
  kind?: string;
  serviceMode?: string;
  city?: string;
  minYearsExperience?: string;
  minRating?: string;
  minReviewCount?: string;
  focus?: string;
  q?: string;
}): DiscoverListFilters {
  const filters: DiscoverListFilters = {};

  const kindRaw = q.kind?.trim();
  if (kindRaw === ProviderKind.TEACHER || kindRaw === ProviderKind.BABYSITTER) {
    filters.kind = kindRaw;
  }

  const modeRaw = q.serviceMode?.trim().toUpperCase();
  if (modeRaw === 'IN_PERSON' || modeRaw === 'ONLINE' || modeRaw === 'HYBRID') {
    filters.serviceMode = modeRaw as ServiceMode;
  }

  const city = q.city?.trim();
  if (city) {
    filters.city = city.slice(0, MAX_CITY_LEN);
  }

  const minY = parseInt(q.minYearsExperience ?? '', 10);
  if (!Number.isNaN(minY) && minY >= 1 && minY <= 60) {
    filters.minYearsExperience = minY;
  }

  const minR = parseFloat(q.minRating ?? '');
  if (!Number.isNaN(minR) && minR >= 1 && minR <= 5) {
    filters.minRating = minR;
  }

  const minC = parseInt(q.minReviewCount ?? '', 10);
  if (!Number.isNaN(minC) && minC >= 1 && minC <= 10_000) {
    filters.minReviewCount = minC;
  }

  const focusRaw = q.focus?.trim();
  if (focusRaw) {
    const tags = [
      ...new Set(
        focusRaw
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      ),
    ].slice(0, MAX_FOCUS_TAGS);
    if (tags.length > 0) {
      filters.focusTags = tags;
    }
  }

  const search = q.q?.trim();
  if (search) {
    filters.search = search.slice(0, MAX_SEARCH_LEN);
  }

  return filters;
}
