import { getInsightForStage } from '../data/development-insights.mock';
import { MOCK_COURSES } from '../data/courses.mock';
import { COURSE_RECOMMENDATION_RULES } from '../data/recommendation-rules.mock';
import { getTemplate } from '../data/scientific-templates.mock';
import type {
  AgeStageId,
  Course,
  PlanSuggestion,
  RecommendationInput,
  UserLearningPlanItem,
} from '../domain/types';
import { createRoadmapItemId } from './ids';
import {
  ageInYearsFromBirth,
  getDevelopmentStageByAge,
  getRecommendedLearningApproach,
} from './development-stage';

function templateBlockToRoadmapItem(
  block: import('../domain/types').ScientificTemplateBlock,
  order: number,
): UserLearningPlanItem {
  return {
    id: createRoadmapItemId(),
    source: 'scientific_template',
    scientificTemplateBlockId: block.id,
    title: block.title,
    notes: block.description,
    order,
    rationale: block.rationale,
    suggestedWeeklyMinutes: block.suggestedWeeklyMinutes,
    milestoneLabels: block.milestoneHints,
  };
}

function collectRuleEffects(
  input: RecommendationInput,
  stageId: AgeStageId,
): {
  boostScores: Map<string, number>;
  appliedRules: { ruleId: string; description: string }[];
} {
  const goalsLower = input.child.goals.join(' ').toLowerCase();
  const boostScores = new Map<string, number>();
  const appliedRules: { ruleId: string; description: string }[] = [];

  for (const rule of COURSE_RECOMMENDATION_RULES) {
    if (rule.categoryId !== input.categoryId || rule.ageStageId !== stageId) {
      continue;
    }
    const kw = rule.goalKeywordBoost;
    const matches =
      kw &&
      kw.length > 0 &&
      kw.some((k) => goalsLower.includes(k.toLowerCase()));
    if (!matches) continue;
    appliedRules.push({ ruleId: rule.id, description: rule.ruleRationale });
    for (const cid of rule.boostedCourseIds) {
      boostScores.set(cid, (boostScores.get(cid) ?? 0) + 3);
    }
  }
  return { boostScores, appliedRules };
}

function courseToRoadmapItem(course: Course, order: number): UserLearningPlanItem {
  return {
    id: createRoadmapItemId(),
    source: 'course',
    courseId: course.id,
    title: course.title,
    notes: course.shortDescription,
    order,
    rationale: `Curso del catálogo (${course.format}). Encaja con la edad y categoría seleccionadas; ajusta la carga según tu tiempo real.`,
    suggestedWeeklyMinutes: course.suggestedWeeklyMinutes,
  };
}

/**
 * Filtra cursos por categoría y rango de edad del menor.
 */
export function getSuggestedCoursesForChild(
  input: RecommendationInput,
  referenceDate: Date = new Date(),
): Course[] {
  const y = ageInYearsFromBirth(input.child.birthDate, referenceDate);
  const stage = getDevelopmentStageByAge(input.child.birthDate, referenceDate);

  let list = MOCK_COURSES.filter(
    (c) =>
      c.categoryId === input.categoryId &&
      y >= c.minAgeYears &&
      y <= c.maxAgeYears,
  );

  const { boostScores } = collectRuleEffects(input, stage.id);

  list = [...list].sort((a, b) => {
    const sb = boostScores.get(b.id) ?? 0;
    const sa = boostScores.get(a.id) ?? 0;
    if (sb !== sa) return sb - sa;
    return a.title.localeCompare(b.title);
  });

  return list;
}

/**
 * Construye la sugerencia completa: plantilla científica + cursos + ítems por defecto.
 */
export function buildDefaultScientificPlan(
  input: RecommendationInput,
  referenceDate: Date = new Date(),
): PlanSuggestion {
  const stage = getDevelopmentStageByAge(input.child.birthDate, referenceDate);
  const { appliedRules } = collectRuleEffects(input, stage.id);
  const template = getTemplate(input.categoryId, stage.id);

  if (!template) {
    throw new Error(
      `No hay plantilla para categoría ${input.categoryId} y etapa ${stage.id}`,
    );
  }

  const suggestedCourses = getSuggestedCoursesForChild(input, referenceDate);
  const defaultRoadmapItems = template.blocks.map((b, i) =>
    templateBlockToRoadmapItem(b, i),
  );

  const approach = getRecommendedLearningApproach(stage, input.categoryId);
  const insight = getInsightForStage(stage.id);

  const weeklyMinutesTemplate = template.blocks.reduce(
    (s, b) => s + b.suggestedWeeklyMinutes,
    0,
  );
  const cap = input.child.weeklyMinutesAvailable;
  let intensity = stage.recommendedIntensity;
  if (cap > 0 && weeklyMinutesTemplate > cap * 1.25) {
    intensity = 'MODERATE';
  }

  const masterRationale = [
    approach.approachSummary,
    `Plantilla "${template.title}": ${template.summary}`,
    `Intensidad sugerida para la etapa: ${stage.recommendedIntensity}. ${
      cap > 0
        ? `Has indicado ~${cap} min/semana; puedes recortar bloques o bajar minutos por bloque.`
        : ''
    }`,
  ].join('\n\n');

  return {
    ageStage: stage,
    template,
    suggestedCourses,
    defaultRoadmapItems,
    weeklyIntensityHint: intensity,
    masterRationale,
    appliedRules,
    relatedInsight: insight,
  };
}

/**
 * Roadmap editable inicial: plantilla + opcionalmente cursos extra al final.
 */
export function generateEditableRoadmap(
  input: RecommendationInput,
  options?: { includeCourseIds?: string[] },
  referenceDate: Date = new Date(),
): {
  suggestion: PlanSuggestion;
  items: UserLearningPlanItem[];
} {
  const suggestion = buildDefaultScientificPlan(input, referenceDate);
  const items = suggestion.defaultRoadmapItems.map((it, i) => ({
    ...it,
    order: i,
  }));

  const extraIds = options?.includeCourseIds ?? [];
  let order = items.length;
  for (const cid of extraIds) {
    const course = MOCK_COURSES.find((c) => c.id === cid);
    if (!course) continue;
    items.push(courseToRoadmapItem(course, order));
    order += 1;
  }

  return { suggestion, items };
}

/** Reordena ítems (0..n-1) tras drag and drop. */
export function reorderRoadmapItems(
  items: UserLearningPlanItem[],
  activeId: string,
  overId: string,
): UserLearningPlanItem[] {
  const oldIndex = items.findIndex((x) => x.id === activeId);
  const newIndex = items.findIndex((x) => x.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items;
  const next = [...items];
  const [removed] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, removed);
  return next.map((it, i) => ({ ...it, order: i }));
}
