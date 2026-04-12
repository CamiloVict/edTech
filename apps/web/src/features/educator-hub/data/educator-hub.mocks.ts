/**
 * Datos demo del hub educador — sustituir por fetch Nest + Prisma.
 */
import type {
  EducatorBadge,
  EducatorInsight,
  EducatorLead,
  EducatorOffer,
  EducatorProfile,
  EducatorResource,
  EducatorReview,
  EducatorSession,
  EducatorStudent,
  ProfileCompletionItem,
  StudentRoadmapSummary,
} from '../domain/types';

export const MOCK_EDUCATOR_PROFILE: EducatorProfile = {
  id: 'prof_mock_1',
  clerkUserId: 'clerk_provider_me',
  fullName: 'Carlos Educador',
  headline: 'Estimulación temprana y acompañamiento respetuoso · 0–8 años',
  email: 'carlos@edify.demo',
  photoUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
  bioShort:
    'Acompaño familias con rutinas de juego, lenguaje y regulación emocional en un clima de calma y confianza.',
  bioLong: `Trabajo desde el juego guiado y la observación respetuosa. Mis sesiones combinan propuestas sensoriales breves, lectura compartida y acuerdos claros con la familia para sostener el aprendizaje entre sesiones.

Me formé en acompañamiento infantil y primeros auxilios pediátricos. Creo en documentar acuerdos y avances de forma sencilla para que padres y madres se sientan respaldados.`,
  yearsOfExperience: 6,
  serviceMode: 'HYBRID',
  city: 'Medellín',
  zones: ['El Poblado', 'Laureles', 'Envigado (previa agenda)'],
  focusAreas: [
    'estimulación temprana',
    'lenguaje oral',
    'rutinas y límites',
  ],
  categories: ['Desarrollo infantil', 'Idiomas', 'Creatividad'],
  ageBands: ['0_3', '4_7'],
  methodology:
    'Enfoque relacional: acuerdos explícitos con la familia, sesiones cortas con cierre visible y seguimiento por notas breves.',
  languages: ['Español', 'Inglés B2'],
  certifications: [
    'Primeros auxilios pediátricos (2023)',
    'Acompañamiento 0–3 (centro certificador regional)',
  ],
  averageRating: 4.85,
  ratingCount: 42,
  isAvailable: true,
  availabilitySummary:
    'Mañanas lun–vie 9:00–13:00; tardes lun/mié/vie 16:00–19:30. Híbrido con seguimiento breve entre sesiones.',
  priceFromMinor: 4500,
  currency: 'EUR',
  videoPresentationUrl: null,
  galleryUrls: [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&h=400&fit=crop',
  ],
  createdAt: '2024-06-01T12:00:00.000Z',
};

export const MOCK_UPCOMING_SESSIONS: EducatorSession[] = [
  {
    id: 's1',
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    status: 'CONFIRMED',
    studentName: 'Lucas Gómez',
    familyName: 'Familia Gómez',
    childName: 'Lucas',
    modality: 'IN_PERSON',
    offerTitle: 'Sesión 1:1 · estimulación',
  },
  {
    id: 's2',
    startsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 86400000 + 2700000).toISOString(),
    status: 'PENDING',
    studentName: 'Emma López',
    familyName: 'Familia López',
    childName: 'Emma',
    modality: 'ONLINE',
    offerTitle: 'Inglés por cuentos · 45 min',
  },
];

export const MOCK_LEADS: EducatorLead[] = [
  {
    id: 'l1',
    familyName: 'Familia Ruiz',
    message:
      'Hola Carlos, buscamos apoyo para rutinas de sueño con nuestra bebé de 18 meses. ¿Tienes cupo en marzo?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'NEW',
    interestedIn: '0–2 años · rutinas',
  },
  {
    id: 'l2',
    familyName: 'Familia Mena',
    message: '¿Ofreces paquete de 4 sesiones presenciales en Laureles?',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'VIEWED',
    interestedIn: 'Paquetes',
  },
];

export const MOCK_STUDENTS: EducatorStudent[] = [
  {
    id: 'st_lucas',
    childFirstName: 'Lucas',
    childAgeYears: 4,
    birthYear: 2021,
    developmentStageLabel: '4–7 años · juego guiado',
    familyName: 'Gómez',
    contactEmail: 'maria.gomez@demo.mail',
    relationship: 'MOTHER',
    learningGoals: ['Más vocabulario en contexto', 'Rutina de lectura 10 min'],
    interests: ['música', 'construcción'],
    active: true,
    lastSessionAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    nextSessionAt: MOCK_UPCOMING_SESSIONS[0]?.startsAt ?? null,
    sessionsCount: 12,
    privateNotes:
      'Responde bien a rutinas visuales. Evitar sobrecarga al final del día.',
    progressSummary:
      'Avance estable en narración oral; próximo foco: sonidos iniciales en juego.',
    roadmapId: 'rm_lucas',
  },
  {
    id: 'st_emma',
    childFirstName: 'Emma',
    childAgeYears: 2,
    birthYear: 2023,
    developmentStageLabel: '0–3 años · exposición y juego',
    familyName: 'López',
    contactEmail: 'ana.lopez@demo.mail',
    relationship: 'MOTHER',
    learningGoals: ['Exposición al inglés sin presión'],
    interests: ['cuentos', 'agua'],
    active: true,
    lastSessionAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    nextSessionAt: MOCK_UPCOMING_SESSIONS[1]?.startsAt ?? null,
    sessionsCount: 6,
    privateNotes: 'Familia muy colaborativa; prefieren sesiones mañana.',
    progressSummary: 'Canciones y gestos; ampliar vocabulario de cuidado diario.',
    roadmapId: 'rm_emma',
  },
];

export const MOCK_OFFERS: EducatorOffer[] = [
  {
    id: 'o1',
    type: 'ONE_TO_ONE',
    title: 'Acompañamiento 1:1 · estimulación 0–3',
    category: 'Desarrollo infantil',
    description:
      'Sesiones breves centradas en juego sensorial seguro y rutinas con la familia.',
    ageBands: ['0_3'],
    modality: 'HYBRID',
    durationMinutes: 50,
    priceMinor: 4500,
    currency: 'EUR',
    objectives: [
      'Regulación y exploración guiada',
      'Pautas concretas para el hogar',
    ],
    methodologyNote: 'Material simple; foco en repetición y calma.',
    suggestedFrequency: '1–2 veces por semana',
    maxSeats: 1,
    status: 'PUBLISHED',
    bookingsCount: 14,
    viewsCount: 312,
  },
  {
    id: 'o2',
    type: 'WORKSHOP',
    title: 'Taller «Cuentos y ritmo» 4–6 años',
    category: 'Lenguaje',
    description: 'Grupo reducido: canto, rima y primeras narraciones.',
    ageBands: ['4_7'],
    modality: 'IN_PERSON',
    durationMinutes: 90,
    priceMinor: 2800,
    currency: 'EUR',
    objectives: ['Fonología lúdica', 'Escucha activa'],
    methodologyNote: 'Círculo + estaciones rotativas.',
    suggestedFrequency: 'Sábados quincenales',
    maxSeats: 8,
    status: 'PUBLISHED',
    bookingsCount: 22,
    viewsCount: 540,
  },
  {
    id: 'o3',
    type: 'MINI_COURSE',
    title: 'Mini curso: inglés por cuentos (6 sesiones)',
    category: 'Idiomas',
    description: 'Secuencia guiada con material enviado antes de cada clase.',
    ageBands: ['4_7', '8_12'],
    modality: 'ONLINE',
    durationMinutes: 45,
    priceMinor: 18000,
    currency: 'EUR',
    objectives: ['Vocabulario temático', 'Frases útiles en contexto'],
    methodologyNote: 'Input comprensible + repetición espaciada.',
    suggestedFrequency: '2 sesiones / semana',
    maxSeats: 6,
    status: 'DRAFT',
    bookingsCount: 0,
    viewsCount: 89,
  },
];

export const MOCK_INSIGHTS: EducatorInsight[] = [
  {
    id: 'i1',
    title: 'Video de presentación',
    body: 'Los perfiles con video corto suelen duplicar la tasa de solicitud de información. Graba 45 s en vertical explicando para quién es tu mejor sesión.',
    priority: 'high',
    category: 'PROFILE',
  },
  {
    id: 'i2',
    title: 'Demanda en fin de semana',
    body: 'Tienes 6 solicitudes vistas este mes para sábado mañana y solo 2 bloques publicados. Abrir 09:00–12:00 podría cubrir esa franja.',
    priority: 'high',
    category: 'DEMAND',
  },
  {
    id: 'i3',
    title: 'Talleres vs 1:1',
    body: 'Tus talleres convierten un 18% mejor que las sesiones individuales en la última ventana de 30 días. Considera duplicar un taller exitoso.',
    priority: 'medium',
    category: 'CONVERSION',
  },
];

export const MOCK_BADGES: EducatorBadge[] = [
  {
    id: 'b1',
    label: 'Educador destacado',
    description: 'Perfil completo y respuesta en menos de 24 h.',
    icon: 'star',
    earned: true,
  },
  {
    id: 'b2',
    label: 'Primera infancia',
    description: 'Experiencia declarada y ofertas activas 0–3.',
    icon: 'leaf',
    earned: true,
  },
  {
    id: 'b3',
    label: 'Alta retención',
    description: 'Familias que repiten sesión en los últimos 90 días.',
    icon: 'heart',
    earned: true,
  },
  {
    id: 'b4',
    label: 'Metodología validada',
    description: 'Completa la sección de metodología y un recurso guardado.',
    icon: 'check',
    earned: false,
  },
];

export const MOCK_REVIEWS: EducatorReview[] = [
  {
    id: 'r1',
    authorName: 'María G.',
    rating: 5,
    excerpt:
      'Muy claro con las rutinas en casa. Lucas espera la sesión con ilusión.',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    offerTitle: '1:1 estimulación',
  },
  {
    id: 'r2',
    authorName: 'Andrés P.',
    rating: 5,
    excerpt: 'Taller de cuentos muy bien estructurado, grupo tranquilo.',
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    offerTitle: 'Taller cuentos',
  },
];

export const MOCK_PROFILE_ITEMS: ProfileCompletionItem[] = [
  {
    id: 'p_vid',
    label: 'Video de presentación',
    done: false,
    impactLabel: '+ conversión estimada',
  },
  {
    id: 'p_meth',
    label: 'Metodología detallada',
    done: true,
    impactLabel: 'Confianza',
  },
  {
    id: 'p_pack',
    label: 'Paquete de sesiones publicado',
    done: false,
    impactLabel: 'Ticket medio',
  },
  {
    id: 'p_zone',
    label: 'Zonas / barrios donde atiendes',
    done: true,
    impactLabel: 'Búsqueda local',
  },
  {
    id: 'p_cert',
    label: 'Certificaciones visibles',
    done: true,
    impactLabel: 'Credibilidad',
  },
];

export const MOCK_RESOURCES: EducatorResource[] = [
  {
    id: 'res1',
    type: 'GUIDE',
    title: 'Guía rápida 0–3: exposición sin presión',
    excerpt: 'Rutinas de 5 minutos para lenguaje receptivo en casa.',
    categoryTags: ['Idiomas', 'Primera infancia'],
    ageBands: ['0_3'],
    readMinutes: 6,
    saved: true,
  },
  {
    id: 'res2',
    type: 'ACTIVITY',
    title: 'Secuencia sensorial con materiales cotidianos',
    excerpt: 'Tres estaciones con reglas de seguridad y cierre.',
    categoryTags: ['Multisensorial'],
    ageBands: ['0_3', '4_7'],
    readMinutes: 10,
    saved: false,
  },
  {
    id: 'res3',
    type: 'TEMPLATE',
    title: 'Plantilla de sesión 50 min (1:1)',
    excerpt: 'Apertura, núcleo, cierre y nota a familia en una página.',
    categoryTags: ['Organización'],
    ageBands: ['4_7', '8_12'],
    readMinutes: 4,
    saved: true,
  },
  {
    id: 'res4',
    type: 'TIP',
    title: 'Límites firmes y amables: frases que funcionan',
    excerpt: 'Cuatro formulaciones para repetir en bloque.',
    categoryTags: ['Convivencia'],
    ageBands: ['4_7'],
    readMinutes: 5,
    saved: false,
  },
];

export const MOCK_ROADMAPS: Record<string, StudentRoadmapSummary> = {
  rm_lucas: {
    studentId: 'st_lucas',
    planTitle: 'Lenguaje y lectura compartida',
    categoryLabel: 'Idiomas / 4–7',
    educatorNotes:
      'Propongo añadir 1 bloque de rima antes de lectura en la próxima quincena.',
    lastCollaborationAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    blocks: [
      {
        id: 'rb1',
        title: 'Lectura compartida 10 min/día',
        rationale: 'Exposición + vocabulario en contexto (plataforma).',
        status: 'ACTIVE',
        source: 'PLATFORM',
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: 'rb2',
        title: 'Juego de sonidos iniciales',
        rationale: 'Sugerido por educador tras la sesión 10.',
        status: 'SUGGESTED',
        source: 'EDUCATOR',
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'rb3',
        title: 'Rutina visual de cierre de día',
        rationale: 'Pedido por familia; marca progreso visible.',
        status: 'DONE',
        source: 'FAMILY',
        updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      },
    ],
  },
  rm_emma: {
    studentId: 'st_emma',
    planTitle: 'Inglés por exposición temprana',
    categoryLabel: 'Idiomas / 0–3',
    educatorNotes: 'Mantener canciones cortas; evitar corrección explícita.',
    lastCollaborationAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    blocks: [
      {
        id: 'e1',
        title: 'Canciones de rutina (baño/merienda)',
        rationale: 'Plantilla científica plataforma.',
        status: 'ACTIVE',
        source: 'PLATFORM',
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
  },
};
