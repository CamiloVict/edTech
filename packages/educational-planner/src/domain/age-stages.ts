import type { AgeStageDefinition, AgeStageId } from './types';

export const AGE_STAGE_ORDER: AgeStageId[] = [
  'STAGE_0_3',
  'STAGE_4_7',
  'STAGE_8_12',
  'STAGE_13_18',
];

export const AGE_STAGES: Record<AgeStageId, AgeStageDefinition> = {
  STAGE_0_3: {
    id: 'STAGE_0_3',
    label: '0–3 años',
    minAgeYears: 0,
    maxAgeYears: 3,
    learningFocus:
      'Inmersión relacional, juego libre y guiado, exposición rica en lenguaje y experiencias multisensoriales.',
    suggestedContentTypes: [
      'inmersión',
      'audio',
      'juego',
      'interacción humana',
      'repetición rítmica',
      'exploración sensorial',
    ],
    recommendedIntensity: 'LOW',
    idealFormats: ['LIVE_HUMAN', 'AUDIO_VIDEO', 'HANDS_ON'],
    structureLevel: 'OPEN_PLAY',
    pedagogicalNotes:
      'Priorizar seguridad emocional, rutinas predecibles y modelado adulto. Evitar explicaciones abstractas prolongadas.',
    neurodevelopmentNotes:
      'Plasticidad máxima y ventanas sensibles al input social y lingüístico; la consolidación depende de repetición significativa en contexto, no de teoría formal.',
  },
  STAGE_4_7: {
    id: 'STAGE_4_7',
    label: '4–7 años',
    minAgeYears: 4,
    maxAgeYears: 7,
    learningFocus:
      'Juego guiado, narrativa, música y práctica multisensorial con estructura ligera.',
    suggestedContentTypes: [
      'storytelling',
      'canciones',
      'juego conversacional',
      'manipulativos',
      'rutinas cortas',
    ],
    recommendedIntensity: 'MODERATE',
    idealFormats: ['LIVE_HUMAN', 'HANDS_ON', 'AUDIO_VIDEO'],
    structureLevel: 'LIGHT_STRUCTURE',
    pedagogicalNotes:
      'Conectar objetivos con historias y personajes. Sesiones breves y frecuentes mejor que bloques largos.',
    neurodevelopmentNotes:
      'Aumenta la regulación atencional; conviene alternar movimiento y foco, y anclar conceptos en experiencias concretas.',
  },
  STAGE_8_12: {
    id: 'STAGE_8_12',
    label: '8–12 años',
    minAgeYears: 8,
    maxAgeYears: 12,
    learningFocus:
      'Exploración estructurada, proyectos cortos, hábitos de práctica y uso de la memoria de trabajo.',
    suggestedContentTypes: [
      'proyectos simples',
      'lectura guiada',
      'experimentación',
      'retroalimentación clara',
      'metas semanales',
    ],
    recommendedIntensity: 'MODERATE',
    idealFormats: ['PROJECT_BASED', 'READING_WRITING', 'MIXED'],
    structureLevel: 'STRUCTURED',
    pedagogicalNotes:
      'Favorecer autonomía creciente con andamiaje: criterios de éxito visibles y revisiones periódicas.',
    neurodevelopmentNotes:
      'Desarrollo de funciones ejecutivas; útil alternar planificación explícita con práctica variada y espacio para error seguro.',
  },
  STAGE_13_18: {
    id: 'STAGE_13_18',
    label: '13–18 años',
    minAgeYears: 13,
    maxAgeYears: 18,
    learningFocus:
      'Objetivos explícitos, autonomía, proyectos con aplicación real y disciplina de estudio.',
    suggestedContentTypes: [
      'metas medibles',
      'proyectos extendidos',
      'práctica deliberada',
      'retroalimentación entre pares',
      'aplicación en contexto real',
    ],
    recommendedIntensity: 'HIGH',
    idealFormats: ['PROJECT_BASED', 'READING_WRITING', 'MIXED'],
    structureLevel: 'GOAL_DRIVEN',
    pedagogicalNotes:
      'Co-construir objetivos y acuerdos de seguimiento. Conectar el aprendizaje con identidad y propósito.',
    neurodevelopmentNotes:
      'Remodelación frontal; la motivación intrínseca y el sentido del esfuerzo influyen fuertemente en la consolidación de hábitos.',
  },
};
