import type { LearningCategoryId } from './types';

export const LEARNING_CATEGORY_LABELS: Record<LearningCategoryId, string> = {
  LANGUAGES: 'Idiomas',
  NUTRITION: 'Nutrición y cocina',
  NATURE_CONNECTION: 'Naturaleza y mundo',
  WOODWORKING: 'Manualidades y carpintería',
  ART_CREATIVITY: 'Arte y creatividad',
  MOVEMENT_BODY: 'Movimiento y cuerpo',
};

export const ALL_CATEGORY_IDS: LearningCategoryId[] = [
  'LANGUAGES',
  'NUTRITION',
  'NATURE_CONNECTION',
  'WOODWORKING',
  'ART_CREATIVITY',
  'MOVEMENT_BODY',
];
