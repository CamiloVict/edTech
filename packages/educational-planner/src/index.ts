/**
 * @repo/educational-planner
 *
 * Dominio + motor por reglas del Educational Planner.
 * Sin dependencias de React: apto para Nest (importación de funciones puras),
 * app web y futura app móvil.
 *
 * Persistencia: mapear `UserLearningPlan` / `UserLearningPlanItem` a tablas Prisma
 * cuando existan migraciones (`planner_plans`, `planner_plan_items`, …).
 */

export * from './domain/types';
export * from './domain/age-stages';
export * from './domain/categories';

export * from './data/courses.mock';
export * from './data/scientific-templates.mock';
export * from './data/development-insights.mock';
export * from './data/recommendation-rules.mock';

export * from './engine/ids';
export * from './engine/development-stage';
export * from './engine/recommendation';
