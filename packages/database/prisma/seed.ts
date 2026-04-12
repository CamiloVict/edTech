import {
  OnboardingStep,
  Prisma,
  PrismaClient,
  ProviderKind,
  RateUnit,
  ServiceMode,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const TZ_BOG = 'America/Bogota';
const TZ_MAD = 'Europe/Madrid';

/** Inicio del día local (medianoche) a partir de `base` + `dayOffset`. */
function dayAt(base: Date, dayOffset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Franja horaria el mismo día que `day` (horas en reloj local del servidor). */
function slotOnDay(
  day: Date,
  startH: number,
  startM: number,
  endH: number,
  endM: number,
): { startsAt: Date; endsAt: Date } {
  const startsAt = new Date(day);
  startsAt.setHours(startH, startM, 0, 0);
  const endsAt = new Date(day);
  endsAt.setHours(endH, endM, 0, 0);
  return { startsAt, endsAt };
}

/**
 * Genera bloques futuros: en los próximos `numDays` días, los días de semana
 * `weekdays` (1=lun … 5=vie, 6=sáb, 0=dom), misma franja horaria cada día.
 */
function repeatingWeekdaySlots(
  base: Date,
  opts: {
    numDays: number;
    weekdays: number[];
    startH: number;
    startM: number;
    endH: number;
    endM: number;
    timezone: string;
  },
): Prisma.ProviderAvailabilityBlockCreateWithoutProviderProfileInput[] {
  const out: Prisma.ProviderAvailabilityBlockCreateWithoutProviderProfileInput[] =
    [];
  for (let i = 1; i <= opts.numDays; i++) {
    const day = dayAt(base, i);
    const dow = day.getDay();
    if (!opts.weekdays.includes(dow)) continue;
    const { startsAt, endsAt } = slotOnDay(
      day,
      opts.startH,
      opts.startM,
      opts.endH,
      opts.endM,
    );
    if (endsAt <= startsAt) continue;
    out.push({
      startsAt,
      endsAt,
      isAllDay: false,
      timezone: opts.timezone,
    });
  }
  return out;
}

/** Varias franjas (p. ej. mañana y tarde) en días laborables. */
function dualShiftWeekdays(
  base: Date,
  timezone: string,
): Prisma.ProviderAvailabilityBlockCreateWithoutProviderProfileInput[] {
  return [
    ...repeatingWeekdaySlots(base, {
      numDays: 21,
      weekdays: [1, 2, 3, 4, 5],
      startH: 9,
      startM: 0,
      endH: 13,
      endM: 0,
      timezone,
    }),
    ...repeatingWeekdaySlots(base, {
      numDays: 21,
      weekdays: [1, 3, 5],
      startH: 16,
      startM: 0,
      endH: 19,
      endM: 30,
      timezone,
    }),
  ];
}

async function clearDb() {
  await prisma.appointment.deleteMany();
  await prisma.providerAvailabilityBlock.deleteMany();
  await prisma.providerRate.deleteMany();
  await prisma.child.deleteMany();
  await prisma.consumerProfile.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Datos de prueba locales. Los `clerkUserId` son ficticios (no coinciden con Clerk real).
 */
async function main() {
  await clearDb();

  const now = new Date();

  await prisma.user.create({
    data: {
      clerkUserId: 'seed_clerk_consumer_completed',
      email: 'familia.demo@seed.trofoschool.local',
      role: UserRole.CONSUMER,
      onboardingStep: OnboardingStep.COMPLETED,
      consumerProfile: {
        create: {
          fullName: 'María Gómez',
          phone: '+57 300 123 4567',
          city: 'Bogotá',
          relationshipToChild: 'Madre',
          isProfileCompleted: true,
          onboardingCompletedAt: now,
          children: {
            create: [
              {
                firstName: 'Lucas',
                birthDate: new Date('2021-03-15'),
                interests: 'Música, juegos sensoriales',
                notes: 'Prefiere actividades cortas por la mañana',
              },
              {
                firstName: 'Emma',
                birthDate: new Date('2023-08-01'),
                interests: 'Cuentos ilustrados',
              },
            ],
          },
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      clerkUserId: 'seed_clerk_consumer_pending_profile',
      email: 'familia.pendiente@seed.trofoschool.local',
      role: UserRole.CONSUMER,
      onboardingStep: OnboardingStep.PENDING_PROFILE,
      consumerProfile: {
        create: {
          fullName: 'Ana López',
          phone: '+57 310 999 0000',
          city: 'Cali',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      clerkUserId: 'seed_clerk_pending_role',
      email: 'nuevo.usuario@seed.trofoschool.local',
      role: null,
      onboardingStep: OnboardingStep.PENDING_ROLE,
    },
  });

  type RateSeed = {
    label: string | null;
    amountMinor: number;
    currency: string;
    unit: RateUnit;
    sortOrder: number;
  };

  type ProviderSeed = {
    clerkUserId: string;
    email: string;
    fullName: string;
    bio: string;
    yearsOfExperience: number;
    focusAreas: string[];
    serviceMode: ServiceMode;
    city: string | null;
    photoUrl: string | null;
    averageRating: string;
    ratingCount: number;
    availabilitySummary: string;
    kinds: ProviderKind[];
    rates: RateSeed[];
    availabilityBlocks: Prisma.ProviderAvailabilityBlockCreateWithoutProviderProfileInput[];
  };

  const providers: ProviderSeed[] = [
    {
      clerkUserId: 'seed_clerk_provider_completed',
      email: 'educador.demo@seed.trofoschool.local',
      fullName: 'Carlos Educador',
      bio: 'Acompaño familias en estimulación temprana y rutinas de juego respetuosas. Creo en espacios tranquilos donde niños y adultos se sientan escuchados.',
      yearsOfExperience: 6,
      focusAreas: ['estimulación temprana', '0-3 años', 'rutinas'],
      serviceMode: ServiceMode.HYBRID,
      city: 'Medellín',
      photoUrl:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      averageRating: '4.85',
      ratingCount: 42,
      availabilitySummary:
        'Mañanas lun–vie 9:00–13:00; tardes lun/mié/vie 16:00–19:30.',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Sesión 1 h (domicilio)',
          amountMinor: 4500,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
        {
          label: 'Paquete 5 sesiones',
          amountMinor: 20000,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 1,
        },
      ],
      availabilityBlocks: dualShiftWeekdays(now, TZ_BOG),
    },
    {
      clerkUserId: 'seed_clerk_provider_babysitter',
      email: 'cuidado.demo@seed.trofoschool.local',
      fullName: 'Patricia Cuidado',
      bio: 'Babysitter certificada en primeros auxilios pediátricos. Experiencia con lactantes y niños en edad preescolar. Ambiente seguro y cariñoso.',
      yearsOfExperience: 8,
      focusAreas: [
        'babysitting',
        'rutinas de sueño',
        'alimentación complementaria',
      ],
      serviceMode: ServiceMode.IN_PERSON,
      city: 'Bogotá',
      photoUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      averageRating: '4.95',
      ratingCount: 67,
      availabilitySummary:
        'Fines de semana y noches con 24 h de aviso; algunos sábados día completo.',
      kinds: [ProviderKind.BABYSITTER],
      rates: [
        {
          label: 'Hora de cuidado',
          amountMinor: 3800,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
        {
          label: 'Noche (22:00–08:00)',
          amountMinor: 8500,
          currency: 'EUR',
          unit: RateUnit.DAY,
          sortOrder: 1,
        },
      ],
      availabilityBlocks: [
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [5, 6], // vie, sáb
          startH: 18,
          startM: 0,
          endH: 22,
          endM: 0,
          timezone: TZ_BOG,
        }),
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [0, 6], // dom, sáb
          startH: 10,
          startM: 0,
          endH: 18,
          endM: 0,
          timezone: TZ_BOG,
        }),
      ],
    },
    {
      clerkUserId: 'seed_clerk_provider_both',
      email: 'luna.dual@seed.trofoschool.local',
      fullName: 'Luna Martínez',
      bio: 'Educadora infantil y acompañamiento en casa. Combino juego guiado con cuidado flexible cuando la familia lo necesita.',
      yearsOfExperience: 4,
      focusAreas: ['lenguaje', 'social-emocional', 'acompañamiento'],
      serviceMode: ServiceMode.HYBRID,
      city: 'Cali',
      photoUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      averageRating: '4.72',
      ratingCount: 28,
      availabilitySummary:
        'Tardes lun–jue 15:00–19:00; sábados mañana 9:00–13:00.',
      kinds: [ProviderKind.TEACHER, ProviderKind.BABYSITTER],
      rates: [
        {
          label: 'Clase / juego guiado (1 h)',
          amountMinor: 3200,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
        {
          label: 'Cuidado + estimulación (2 h)',
          amountMinor: 5500,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 1,
        },
      ],
      availabilityBlocks: [
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [1, 2, 3, 4],
          startH: 15,
          startM: 0,
          endH: 19,
          endM: 0,
          timezone: TZ_BOG,
        }),
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [6],
          startH: 9,
          startM: 0,
          endH: 13,
          endM: 0,
          timezone: TZ_BOG,
        }),
      ],
    },
    {
      clerkUserId: 'seed_clerk_provider_music',
      email: 'andres.musica@seed.trofoschool.local',
      fullName: 'Andrés Ríos',
      bio: 'Músico y pedagogo: primer acercamiento a ritmo, canto y audición en 3–8 años. Clases online con material que enviamos antes.',
      yearsOfExperience: 10,
      focusAreas: ['música infantil', 'audición', 'online'],
      serviceMode: ServiceMode.ONLINE,
      city: 'Medellín',
      photoUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      averageRating: '4.91',
      ratingCount: 56,
      availabilitySummary: 'Martes y jueves 17:00–20:00 (COT).',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Clase online 45 min',
          amountMinor: 2800,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 0,
        },
      ],
      availabilityBlocks: repeatingWeekdaySlots(now, {
        numDays: 21,
        weekdays: [2, 4],
        startH: 17,
        startM: 0,
        endH: 20,
        endM: 0,
        timezone: TZ_BOG,
      }),
    },
    {
      clerkUserId: 'seed_clerk_provider_english',
      email: 'sofia.ingles@seed.trofoschool.local',
      fullName: 'Sofía Herrera',
      bio: 'Inglés por inmersión con juegos y cuentos. Cambridge C1; experiencia en aulas 4–10 años y refuerzo escolar.',
      yearsOfExperience: 7,
      focusAreas: ['inglés', 'lectoescritura', 'refuerzo escolar'],
      serviceMode: ServiceMode.HYBRID,
      city: 'Bogotá',
      photoUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      averageRating: '4.88',
      ratingCount: 91,
      availabilitySummary: 'Lun–vie tardes 15:30–19:00; sáb 9:00–12:00.',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Sesión 1 h',
          amountMinor: 3600,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
        {
          label: 'Plan mensual 8 sesiones',
          amountMinor: 24000,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 1,
        },
      ],
      availabilityBlocks: [
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [1, 2, 3, 4, 5],
          startH: 15,
          startM: 30,
          endH: 19,
          endM: 0,
          timezone: TZ_BOG,
        }),
        ...repeatingWeekdaySlots(now, {
          numDays: 21,
          weekdays: [6],
          startH: 9,
          startM: 0,
          endH: 12,
          endM: 0,
          timezone: TZ_BOG,
        }),
      ],
    },
    {
      clerkUserId: 'seed_clerk_provider_stem',
      email: 'diego.stem@seed.trofoschool.local',
      fullName: 'Diego Paredes',
      bio: 'Ingeniero y tutor STEM: experimentos seguros, lógica y robótica introductoria para curiosos de 8–14 años.',
      yearsOfExperience: 5,
      focusAreas: ['matemáticas', 'ciencias', 'pensamiento lógico'],
      serviceMode: ServiceMode.IN_PERSON,
      city: 'Cali',
      photoUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      averageRating: '4.79',
      ratingCount: 34,
      availabilitySummary: 'Solo mañanas mié y vie 8:00–12:00.',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Taller 90 min',
          amountMinor: 4200,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 0,
        },
      ],
      availabilityBlocks: repeatingWeekdaySlots(now, {
        numDays: 21,
        weekdays: [3, 5],
        startH: 8,
        startM: 0,
        endH: 12,
        endM: 0,
        timezone: TZ_BOG,
      }),
    },
    {
      clerkUserId: 'seed_clerk_provider_montessori',
      email: 'isabel.montessori@seed.trofoschool.local',
      fullName: 'Isabel Moreno',
      bio: 'Guía Montessori 0–6. Ambientes preparados y respeto por el ritmo del niño; acompañamiento también a padres.',
      yearsOfExperience: 12,
      focusAreas: ['Montessori', 'autonomía', '0-6 años'],
      serviceMode: ServiceMode.IN_PERSON,
      city: 'Bogotá',
      photoUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      averageRating: '4.97',
      ratingCount: 73,
      availabilitySummary: 'Lun–jue 8:00–12:00; citas individuales.',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Observación + guía 1 h',
          amountMinor: 5500,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
        {
          label: 'Día de acompañamiento',
          amountMinor: 12000,
          currency: 'EUR',
          unit: RateUnit.DAY,
          sortOrder: 1,
        },
      ],
      availabilityBlocks: repeatingWeekdaySlots(now, {
        numDays: 21,
        weekdays: [1, 2, 3, 4],
        startH: 8,
        startM: 0,
        endH: 12,
        endM: 0,
        timezone: TZ_BOG,
      }),
    },
    {
      clerkUserId: 'seed_clerk_provider_madrid',
      email: 'elena.madrid@seed.trofoschool.local',
      fullName: 'Elena Vázquez',
      bio: 'Profesora de infantil en España; refuerzo de lengua y matemáticas en primaria. Presencial en zona norte de Madrid.',
      yearsOfExperience: 9,
      focusAreas: ['lengua', 'matemáticas', 'deberes'],
      serviceMode: ServiceMode.IN_PERSON,
      city: 'Madrid',
      photoUrl:
        'https://images.unsplash.com/photo-1594744801329-3a89c3fc3bfa?w=400&h=400&fit=crop',
      averageRating: '4.83',
      ratingCount: 48,
      availabilitySummary: 'Tardes lun–vie 16:00–20:00 (CET).',
      kinds: [ProviderKind.TEACHER],
      rates: [
        {
          label: 'Hora de refuerzo',
          amountMinor: 2200,
          currency: 'EUR',
          unit: RateUnit.HOUR,
          sortOrder: 0,
        },
      ],
      availabilityBlocks: repeatingWeekdaySlots(now, {
        numDays: 21,
        weekdays: [1, 2, 3, 4, 5],
        startH: 16,
        startM: 0,
        endH: 20,
        endM: 0,
        timezone: TZ_MAD,
      }),
    },
    {
      clerkUserId: 'seed_clerk_provider_weekend',
      email: 'camilo.weekend@seed.trofoschool.local',
      fullName: 'Camilo Ortiz',
      bio: 'Canguro para salidas de fin de semana o eventos. Dos referencias verificables y kit de actividades al aire libre.',
      yearsOfExperience: 3,
      focusAreas: ['babysitting', 'actividades al aire libre', '2-10 años'],
      serviceMode: ServiceMode.IN_PERSON,
      city: 'Bogotá',
      photoUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      averageRating: '4.65',
      ratingCount: 19,
      availabilitySummary: 'Sábados y domingos 10:00–20:00.',
      kinds: [ProviderKind.BABYSITTER],
      rates: [
        {
          label: 'Bloque 4 h',
          amountMinor: 6000,
          currency: 'EUR',
          unit: RateUnit.SESSION,
          sortOrder: 0,
        },
      ],
      availabilityBlocks: repeatingWeekdaySlots(now, {
        numDays: 21,
        weekdays: [0, 6],
        startH: 10,
        startM: 0,
        endH: 20,
        endM: 0,
        timezone: TZ_BOG,
      }),
    },
  ];

  for (const p of providers) {
    await prisma.user.create({
      data: {
        clerkUserId: p.clerkUserId,
        email: p.email,
        role: UserRole.PROVIDER,
        onboardingStep: OnboardingStep.COMPLETED,
        providerProfile: {
          create: {
            fullName: p.fullName,
            bio: p.bio,
            yearsOfExperience: p.yearsOfExperience,
            focusAreas: p.focusAreas,
            serviceMode: p.serviceMode,
            city: p.city,
            isProfileCompleted: true,
            onboardingCompletedAt: now,
            photoUrl: p.photoUrl,
            averageRating: new Prisma.Decimal(p.averageRating),
            ratingCount: p.ratingCount,
            isAvailable: true,
            availabilitySummary: p.availabilitySummary,
            kinds: p.kinds,
            rates: {
              create: p.rates.map((r) => ({
                label: r.label,
                amountMinor: r.amountMinor,
                currency: r.currency,
                unit: r.unit,
                sortOrder: r.sortOrder,
              })),
            },
            availabilityBlocks: {
              create: p.availabilityBlocks,
            },
          },
        },
      },
    });
  }

  console.log(
    `Seed OK: ${providers.length} educadores con tarifas + bloques de disponibilidad, 2 familias de prueba, 1 usuario sin rol.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
