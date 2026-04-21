import { PLATFORM_DEFAULT_CURRENCY } from '@repo/currency';

import type {
  AgeBand,
  EducatorAppointmentStatus,
  EducatorResourceType,
  OfferStatus,
  OfferType,
  RoadmapBlockStatus,
  ServiceMode,
} from '../domain/types';

const MODE: Record<ServiceMode, string> = {
  IN_PERSON: 'Presencial',
  ONLINE: 'En línea',
  HYBRID: 'Combinado',
};

const AGE: Record<AgeBand, string> = {
  '0_3': '0–3',
  '4_7': '4–7',
  '8_12': '8–12',
  '13_18': '13–18',
};

const OFFER_TYPE: Record<OfferType, string> = {
  ONE_TO_ONE: '1:1',
  WORKSHOP: 'Taller',
  MINI_COURSE: 'Mini curso',
  AGE_PROGRAM: 'Programa por edad',
  LEARNING_PATH: 'Ruta',
  EXPERIENCE: 'Experiencia',
  CUSTOM: 'Personalizada',
};

const OFFER_STATUS: Record<OfferStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  PAUSED: 'Pausada',
};

const SESSION: Record<EducatorAppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Rechazada',
  CANCELLED_BY_FAMILY: 'Cancelada (familia)',
  CANCELLED_BY_PROVIDER: 'Cancelada (educador)',
  COMPLETED: 'Completada',
};

const ROADMAP: Record<RoadmapBlockStatus, string> = {
  SUGGESTED: 'Sugerido',
  ACTIVE: 'Activo',
  DONE: 'Hecho',
  ADJUSTED: 'Ajustado',
};

const RESOURCE: Record<EducatorResourceType, string> = {
  GUIDE: 'Guía',
  ACTIVITY: 'Actividad',
  DEVELOPMENT: 'Desarrollo',
  TEMPLATE: 'Plantilla',
  SEQUENCE: 'Secuencia',
  TIP: 'Tip',
  BEST_PRACTICE: 'Buena práctica',
};

export function formatServiceMode(m: ServiceMode): string {
  return MODE[m];
}

export function formatAgeBands(bands: AgeBand[]): string {
  return bands.map((b) => AGE[b]).join(', ');
}

export function formatOfferType(t: OfferType): string {
  return OFFER_TYPE[t];
}

export function formatOfferStatus(s: OfferStatus): string {
  return OFFER_STATUS[s];
}

export function formatSessionStatus(s: EducatorAppointmentStatus): string {
  return SESSION[s];
}

export function formatRoadmapBlockStatus(s: RoadmapBlockStatus): string {
  return ROADMAP[s];
}

export function formatResourceType(t: EducatorResourceType): string {
  return RESOURCE[t];
}

export function formatMoneyMinor(
  minor: number,
  currency: string,
  locale?: string,
): string {
  const code = (currency || PLATFORM_DEFAULT_CURRENCY).toUpperCase();
  const effectiveLocale =
    locale ?? (code === 'COP' ? 'es-CO' : 'es-ES');
  try {
    return new Intl.NumberFormat(effectiveLocale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(0)} ${code}`;
  }
}

export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

export function formatShortDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatSessionRange(isoStart: string, isoEnd: string): string {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const d = a.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
    const t0 = a.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const t1 = b.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return `${d} · ${t0} – ${t1}`;
  } catch {
    return `${isoStart} – ${isoEnd}`;
  }
}

export function formatRelativeDay(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const day = 86400000;
    const diff = Math.round((d.getTime() - now.getTime()) / day);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}
