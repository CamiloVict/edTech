import type { CourseRecommendationRule } from '../domain/types';

/**
 * Reglas declarativas. El motor aplica matching por categoría, etapa y palabras en objetivos.
 */
export const COURSE_RECOMMENDATION_RULES: CourseRecommendationRule[] = [
  {
    id: 'rule-lang-speaking',
    categoryId: 'LANGUAGES',
    ageStageId: 'STAGE_8_12',
    goalKeywordBoost: ['speak', 'hablar', 'oral', 'convers'],
    boostedCourseIds: ['c-lang-conv-8'],
    ruleRationale:
      'Si el objetivo menciona conversación oral, priorizamos práctica guiada en vivo.',
  },
  {
    id: 'rule-lang-teen-project',
    categoryId: 'LANGUAGES',
    ageStageId: 'STAGE_13_18',
    goalKeywordBoost: ['proyecto', 'video', 'podcast', 'real'],
    boostedCourseIds: ['c-lang-teen-13'],
    ruleRationale:
      'Objetivos de aplicación real encajan con proyecto comunicativo integrado.',
  },
  {
    id: 'rule-nut-teen-plan',
    categoryId: 'NUTRITION',
    ageStageId: 'STAGE_13_18',
    goalKeywordBoost: ['plan', 'compra', 'autonom'],
    boostedCourseIds: ['c-nut-teen-13'],
    ruleRationale:
      'Planificación y autonomía alimentaria se entrenan con proyectos de menú.',
  },
  {
    id: 'rule-nat-project',
    categoryId: 'NATURE_CONNECTION',
    ageStageId: 'STAGE_13_18',
    goalKeywordBoost: ['huerto', 'proyecto', 'medio'],
    boostedCourseIds: ['c-nat-project-13'],
    ruleRationale:
      'Proyectos de largo aliento conectan observación con responsabilidad.',
  },
];
