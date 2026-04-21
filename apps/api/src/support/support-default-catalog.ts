import { Prisma } from '@repo/database';

/**
 * Catálogo mínimo si la BD aún no tiene filas (p. ej. migración sin `prisma db seed`).
 * Idempotente: solo se inserta cuando no hay categorías activas.
 */
export const DEFAULT_SUPPORT_CATEGORIES: Prisma.SupportComplaintCategoryCreateManyInput[] =
  [
    {
      code: 'NO_SHOW',
      labelEs: 'El educador no se presentó',
      descriptionEs:
        'La sesión estaba confirmada y el educador no asistió.',
      parentCode: null,
      sortOrder: 10,
      active: true,
    },
    {
      code: 'LATE_START',
      labelEs: 'La sesión empezó tarde',
      parentCode: null,
      sortOrder: 20,
      active: true,
    },
    {
      code: 'QUALITY',
      labelEs: 'Calidad de la enseñanza',
      parentCode: null,
      sortOrder: 30,
      active: true,
    },
    {
      code: 'TECHNICAL',
      labelEs: 'Problemas técnicos (audio / vídeo)',
      parentCode: null,
      sortOrder: 40,
      active: true,
    },
    {
      code: 'BILLING',
      labelEs: 'Facturación o cobro',
      parentCode: null,
      sortOrder: 50,
      active: true,
    },
    {
      code: 'SHORT_SESSION',
      labelEs: 'Sesión más corta de lo acordado',
      parentCode: null,
      sortOrder: 25,
      active: true,
    },
    {
      code: 'OTHER',
      labelEs: 'Otro',
      parentCode: null,
      sortOrder: 90,
      active: true,
    },
  ];

export const DEFAULT_SUPPORT_RULES: Omit<
  Prisma.SupportResolutionRuleCreateManyInput,
  'id'
>[] = [
  {
    categoryCode: 'NO_SHOW',
    name: 'No-show → crédito / reembolso recomendado',
    priority: 100,
    conditionsJson: {},
    actionType: 'REFUND_OR_CREDIT_FULL',
    actionPayload: { channel: 'billing_queue', slaHours: 72 },
    autoConfidence: new Prisma.Decimal('0.9'),
    active: true,
  },
  {
    categoryCode: 'SHORT_SESSION',
    name: 'Sesión corta → parcial si minutos reportados',
    priority: 90,
    conditionsJson: { maxActualMinutes: 30 },
    actionType: 'REFUND_PARTIAL',
    actionPayload: { percent: 50 },
    autoConfidence: new Prisma.Decimal('0.62'),
    active: true,
  },
  {
    categoryCode: 'TECHNICAL',
    name: 'Técnico → reprogramación',
    priority: 85,
    conditionsJson: {},
    actionType: 'OFFER_RESCHEDULE',
    actionPayload: { maxRescheduleOffers: 2 },
    autoConfidence: new Prisma.Decimal('0.74'),
    active: true,
  },
  {
    categoryCode: 'LATE_START',
    name: 'Tarde sin no-show → revisión humana',
    priority: 70,
    conditionsJson: {},
    actionType: 'PARTIAL_CREDIT',
    actionPayload: { percent: 15 },
    autoConfidence: new Prisma.Decimal('0.48'),
    active: true,
  },
  {
    categoryCode: 'QUALITY',
    name: 'Calidad → siempre revisión',
    priority: 60,
    conditionsJson: {},
    actionType: 'ESCALATE',
    actionPayload: { team: 'pedagogy' },
    autoConfidence: new Prisma.Decimal('0.35'),
    active: true,
  },
  {
    categoryCode: 'BILLING',
    name: 'Facturación → finanzas',
    priority: 80,
    conditionsJson: {},
    actionType: 'ESCALATE',
    actionPayload: { team: 'billing' },
    autoConfidence: new Prisma.Decimal('0.32'),
    active: true,
  },
  {
    categoryCode: 'OTHER',
    name: 'Otro → cola general',
    priority: 10,
    conditionsJson: {},
    actionType: 'ESCALATE',
    actionPayload: { team: 'general' },
    autoConfidence: new Prisma.Decimal('0.28'),
    active: true,
  },
];
