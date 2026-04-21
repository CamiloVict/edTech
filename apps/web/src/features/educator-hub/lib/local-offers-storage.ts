import type { EducatorOffer } from '@/features/educator-hub/domain/types';

const STORAGE_PREFIX = 'trofo.educatorOffers.v1';
const MIGRATED_PREFIX = 'trofo.educatorOffersMigratedToApi.v1';

export function offersStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}.${userId}`;
}

export function offersApiMigrationKey(userId: string): string {
  return `${MIGRATED_PREFIX}.${userId}`;
}

export function hasMigratedLocalOffersToApi(userId: string): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(offersApiMigrationKey(userId)) === '1';
}

export function markLocalOffersMigratedToApi(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(offersApiMigrationKey(userId), '1');
    window.localStorage.removeItem(offersStorageKey(userId));
  } catch {
    // ignore
  }
}

export function loadLocalOffers(userId: string): EducatorOffer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(offersStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as EducatorOffer[];
  } catch {
    return [];
  }
}

export function saveLocalOffers(userId: string, offers: EducatorOffer[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(offersStorageKey(userId), JSON.stringify(offers));
  } catch {
    // ignore quota / private mode
  }
}

export function newOfferId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `of_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
