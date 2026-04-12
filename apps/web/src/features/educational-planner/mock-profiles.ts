import type { PlannerChildProfile } from '@repo/educational-planner';

/**
 * Perfiles demo para validar coherencia por edad sin backend.
 */
export const PLANNER_DEMO_CHILDREN: PlannerChildProfile[] = [
  {
    id: 'demo-26m',
    displayName: 'Alex',
    birthDate: '2023-06-15',
    interests: ['música', 'agua'],
    goals: ['más palabras en casa'],
    weeklyMinutesAvailable: 120,
    learningPreferenceTags: ['rutinas cortas'],
  },
  {
    id: 'demo-6y',
    displayName: 'Martina',
    birthDate: '2019-03-10',
    interests: ['cuentos', 'parque'],
    goals: ['hablar', 'oral'],
    weeklyMinutesAvailable: 150,
  },
  {
    id: 'demo-10y',
    displayName: 'Leo',
    birthDate: '2015-11-01',
    interests: ['ciencia', 'fútbol'],
    goals: ['mejorar lectura en inglés'],
    weeklyMinutesAvailable: 180,
  },
  {
    id: 'demo-15y',
    displayName: 'Noa',
    birthDate: '2010-09-20',
    interests: ['video', 'debate'],
    goals: ['proyecto podcast inglés', 'speaking'],
    weeklyMinutesAvailable: 240,
  },
];

export const DEFAULT_PLANNER_CHILD = PLANNER_DEMO_CHILDREN[0]!;
