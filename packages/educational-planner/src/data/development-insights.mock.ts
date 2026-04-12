import type { DevelopmentInsight } from '../domain/types';

export const DEVELOPMENT_INSIGHTS: DevelopmentInsight[] = [
  {
    id: 'ins-0-3',
    ageStageId: 'STAGE_0_3',
    title: 'Ventana social y lingüística',
    body: 'El cerebro prioriza estadísticas del lenguaje a partir de interacciones cálidas y repetidas. La “enseñanza” explícita tiene menor retorno que el juego compartido y la rutina narrada.',
  },
  {
    id: 'ins-4-7',
    ageStageId: 'STAGE_4_7',
    title: 'Juego simbólico y primeras abstracciones',
    body: 'El niño integra reglas sociales y lenguaje en escenarios ficticios. Las micro-secuencias con material concreto preparan atención sostenida sin agotar la regulación emocional.',
  },
  {
    id: 'ins-8-12',
    ageStageId: 'STAGE_8_12',
    title: 'Memoria de trabajo en crecimiento',
    body: 'Puede sostener reglas y estrategias si son visibles y breves. Los proyectos cortos con retroalimentación clara consolidan hábitos mejor que maratones ambiguos.',
  },
  {
    id: 'ins-13-18',
    ageStageId: 'STAGE_13_18',
    title: 'Motivación y sentido',
    body: 'La dopamina de recompensa responde fuerte a metas percibidas como auténticas. Co-construir objetivos y enlazarlos a comunidad o futuro mejora adherencia.',
  },
];

export function getInsightForStage(
  ageStageId: import('../domain/types').AgeStageId,
): DevelopmentInsight | undefined {
  return DEVELOPMENT_INSIGHTS.find((i) => i.ageStageId === ageStageId);
}
