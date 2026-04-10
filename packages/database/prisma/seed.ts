import {
  OnboardingStep,
  Prisma,
  PrismaClient,
  ProviderKind,
  ServiceMode,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Datos de prueba locales. Los `clerkUserId` son ficticios.
 */
async function main() {
  await prisma.child.deleteMany();
  await prisma.consumerProfile.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

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
      clerkUserId: 'seed_clerk_provider_completed',
      email: 'educador.demo@seed.trofoschool.local',
      role: UserRole.PROVIDER,
      onboardingStep: OnboardingStep.COMPLETED,
      providerProfile: {
        create: {
          fullName: 'Carlos Educador',
          bio: 'Acompaño familias en estimulación temprana y rutinas de juego respetuosas. Creo en espacios tranquilos donde niños y adultos se sientan escuchados.',
          yearsOfExperience: 6,
          focusAreas: ['estimulación temprana', '0-3 años', 'rutinas'],
          serviceMode: ServiceMode.HYBRID,
          city: 'Medellín',
          isProfileCompleted: true,
          onboardingCompletedAt: now,
          photoUrl:
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
          averageRating: new Prisma.Decimal('4.85'),
          ratingCount: 42,
          isAvailable: true,
          availabilitySummary:
            'Mañanas lun–vie 8:00–13:00; algunas tardes bajo cita. Próximamente horarios fijos en la app.',
          kinds: [ProviderKind.TEACHER],
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      clerkUserId: 'seed_clerk_provider_babysitter',
      email: 'cuidado.demo@seed.trofoschool.local',
      role: UserRole.PROVIDER,
      onboardingStep: OnboardingStep.COMPLETED,
      providerProfile: {
        create: {
          fullName: 'Patricia Cuidado',
          bio: 'Babysitter certificada en primeros auxilios pediátricos. Experiencia con lactantes y niños en edad preescolar. Ambiente seguro y cariñoso.',
          yearsOfExperience: 8,
          focusAreas: ['babysitting', 'rutinas de sueño', 'alimentación complementaria'],
          serviceMode: ServiceMode.IN_PERSON,
          city: 'Bogotá',
          isProfileCompleted: true,
          onboardingCompletedAt: now,
          photoUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
          averageRating: new Prisma.Decimal('4.95'),
          ratingCount: 67,
          isAvailable: true,
          availabilitySummary:
            'Noches y fines con 24 h de anticipación. Sábados completos disponibles.',
          kinds: [ProviderKind.BABYSITTER],
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      clerkUserId: 'seed_clerk_provider_both',
      email: 'luna.dual@seed.trofoschool.local',
      role: UserRole.PROVIDER,
      onboardingStep: OnboardingStep.COMPLETED,
      providerProfile: {
        create: {
          fullName: 'Luna Martínez',
          bio: 'Educadora infantil y acompañamiento en casa. Combino juego guiado con cuidado flexible cuando la familia lo necesita.',
          yearsOfExperience: 4,
          focusAreas: ['lenguaje', 'social-emocional', 'acompañamiento'],
          serviceMode: ServiceMode.HYBRID,
          city: 'Cali',
          isProfileCompleted: true,
          onboardingCompletedAt: now,
          photoUrl:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
          averageRating: new Prisma.Decimal('4.72'),
          ratingCount: 28,
          isAvailable: true,
          availabilitySummary:
            'Entre semana tardes 15:00–19:00; algunas mañanas para cuidado puntual.',
          kinds: [ProviderKind.TEACHER, ProviderKind.BABYSITTER],
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

  console.log('Seed OK: usuarios de prueba + 3 perfiles públicos de proveedor.');
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
