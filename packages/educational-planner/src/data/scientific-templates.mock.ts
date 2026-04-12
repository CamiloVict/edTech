import { AGE_STAGE_ORDER, AGE_STAGES } from '../domain/age-stages';
import { ALL_CATEGORY_IDS, LEARNING_CATEGORY_LABELS } from '../domain/categories';
import type {
  AgeStageId,
  LearningCategoryId,
  ScientificPlanTemplate,
  ScientificTemplateBlock,
} from '../domain/types';

type Block = Omit<ScientificTemplateBlock, 'id'>;

function makeTemplate(
  id: string,
  categoryId: LearningCategoryId,
  ageStageId: AgeStageId,
  title: string,
  summary: string,
  blocks: Block[],
): ScientificPlanTemplate {
  return {
    id,
    categoryId,
    ageStageId,
    version: 1,
    title,
    summary,
    blocks: blocks.map((b, i) => ({
      ...b,
      id: `${id}-b${i}`,
    })),
  };
}

function languagesBlocks(stage: AgeStageId): Block[] {
  switch (stage) {
    case 'STAGE_0_3':
      return [
        {
          title: 'Exposición auditiva cotidiana',
          description:
            'Canciones, rima y lenguaje adulto rico mientras se comparten rutinas.',
          rationale:
            'A esta edad el input lingüístico frecuente y afectivo predice mejor que la instrucción formal.',
          suggestedWeeklyMinutes: 60,
          milestoneHints: ['Escucha atenta a sonidos familiares'],
        },
        {
          title: 'Interacción bilingüe o con educador',
          description:
            'Turnos breves de “servir y devolver” con gestos y objetos.',
          rationale:
            'La conversación encarnada refuerza fonética y pragmática antes de reglas abstractas.',
          suggestedWeeklyMinutes: 45,
        },
        {
          title: 'Cuentos muy cortos con repetición',
          description: 'Mismo libro varias veces; énfasis en ritmo, no en memorizar palabras.',
          rationale:
            'La repetición predecible apoya predicción lingüística y seguridad emocional.',
          suggestedWeeklyMinutes: 30,
        },
      ];
    case 'STAGE_4_7':
      return [
        {
          title: 'Juego conversacional temático',
          description: 'Rol + objetos: mercado, médico, viaje; vocabulario en uso.',
          rationale:
            'El lenguaje en juego estructurado mejora fluidez sin fatiga metalingüística.',
          suggestedWeeklyMinutes: 50,
        },
        {
          title: 'Storytelling con secuencia',
          description: 'Primero-medio-fin con dibujo o fichas.',
          rationale:
            'La narrativa soporta cohesión textual y memoria de trabajo verbal.',
          suggestedWeeklyMinutes: 40,
        },
        {
          title: 'Canciones con gesto y movimiento',
          description: 'Separar sílabas, rimas y ritmo corporal.',
          rationale:
            'La musicalidad apoya conciencia fonológica sin “clase de gramática”.',
          suggestedWeeklyMinutes: 30,
        },
      ];
    case 'STAGE_8_12':
      return [
        {
          title: 'Lectura compartida + mini resumen',
          description: 'Párrafos cortos; preguntas inferencia ligeras.',
          rationale:
            'Transición hacia lectura autónoma con andamiaje explícito pero breve.',
          suggestedWeeklyMinutes: 55,
        },
        {
          title: 'Conversación guiada semanal',
          description: 'Tema + 5 palabras objetivo usadas en frases propias.',
          rationale:
            'Objetivos pequeños y alcanzables sostienen motivación y práctica deliberada.',
          suggestedWeeklyMinutes: 45,
        },
        {
          title: 'Estructura ligera (patrones)',
          description: 'Detectar patrones en frases, no tablas abstractas largas.',
          rationale:
            'La inducción guiada respeta límites de atención sostenida típicos de la etapa.',
          suggestedWeeklyMinutes: 35,
        },
      ];
    default:
      return [
        {
          title: 'Metas comunicativas concretas',
          description: 'Ej.: presentar opinión en 90s, escribir correo breve real.',
          rationale:
            'La utilidad social aumenta adherencia y transferencia del aprendizaje.',
          suggestedWeeklyMinutes: 60,
        },
        {
          title: 'Speaking deliberado + feedback',
          description: 'Grabación opcional, rúbrica simple de claridad.',
          rationale:
            'La retroalimentación específica acelera ajuste motor articulatorio y léxico.',
          suggestedWeeklyMinutes: 50,
        },
        {
          title: 'Writing con revisión en dos pasos',
          description: 'Borrador → criterios → versión final corta.',
          rationale:
            'Separar generación y edición alivia carga ejecutiva en escritura.',
          suggestedWeeklyMinutes: 55,
        },
        {
          title: 'Preparación funcional (entrevista, viaje, estudio)',
          description: 'Escenarios reales elegidos por la familia.',
          rationale:
            'Alinea disciplina de estudio con autonomía emergente del adolescente.',
          suggestedWeeklyMinutes: 40,
        },
      ];
  }
}

function nutritionBlocks(stage: AgeStageId): Block[] {
  if (stage === 'STAGE_0_3') {
    return [
      {
        title: 'Exposición sin presión',
        description: 'Ver, oler, tocar alimentos en contexto de juego.',
        rationale:
          'La neofobia es esperable; la exposición repetida en clima seguro predice aceptación.',
        suggestedWeeklyMinutes: 30,
      },
      {
        title: 'Rutina de comidas compartidas',
        description: 'Modelado adulto visible; evitar negociación en cada bocado.',
        rationale:
          'El modelado social es más potente que la recompensa externa sostenida.',
        suggestedWeeklyMinutes: 120,
      },
    ];
  }
  if (stage === 'STAGE_4_7') {
    return [
      {
        title: 'Cocina guiada semanal',
        description: 'Roles físicos: medir, verter, nombrar texturas.',
        rationale:
          'La manipulación multisensorial vincula lenguaje, número y autonomía.',
        suggestedWeeklyMinutes: 50,
      },
      {
        title: 'Conversación sobre hambre y saciedad',
        description: 'Escala simple de “barriga” con dibujos.',
        rationale:
          'Regulación interoceptiva apoya hábitos sin moralizar el apetito.',
        suggestedWeeklyMinutes: 20,
      },
    ];
  }
  if (stage === 'STAGE_8_12') {
    return [
      {
        title: 'Plan de snack saludable',
        description: 'Lista, compra y porción con lectura de etiqueta básica.',
        rationale:
          'Proyecto corto integra matemática aplicada y alfabetización alimentaria.',
        suggestedWeeklyMinutes: 45,
      },
      {
        title: 'Hidratación y deporte',
        description: 'Registrar botellas y sensación de energía (subjetivo simple).',
        rationale:
          'Automonitoreo ligero favorece hábitos sin obsesión métrica.',
        suggestedWeeklyMinutes: 25,
      },
    ];
  }
  return [
    {
      title: 'Planificación semanal de comidas',
      description: 'Criterios: tiempo, coste, fibra, proteína.',
      rationale:
        'La planificación explícita es señal de autonomía y pensamiento sistémico.',
      suggestedWeeklyMinutes: 60,
    },
    {
      title: 'Cocina para otros',
      description: 'Un plato completo con responsabilidad de seguridad.',
      rationale:
        'Servir a otros refuerza empatía y estándares de higiene.',
      suggestedWeeklyMinutes: 90,
    },
  ];
}

function natureBlocks(stage: AgeStageId): Block[] {
  if (stage === 'STAGE_0_3') {
    return [
      {
        title: 'Estimulación sensorial al aire libre',
        description: 'Césped, viento, sombras; narración adulta continua.',
        rationale:
          'El vínculo afectivo con el entorno natural comienza por experiencia directa segura.',
        suggestedWeeklyMinutes: 40,
      },
    ];
  }
  if (stage === 'STAGE_4_7') {
    return [
      {
        title: 'Colecciones ordenadas (hojas, piedras)',
        description: 'Clasificar por una sola regla a la vez.',
        rationale:
          'Clasificación simple apoya pensamiento científico sin jerga abstracta.',
        suggestedWeeklyMinutes: 35,
      },
      {
        title: 'Historias del barrio natural',
        description: 'Quién vive bajo la corteza, qué sonido hace el viento.',
        rationale:
          'Narrativa + observación ancla conceptos ecológicos básicos.',
        suggestedWeeklyMinutes: 30,
      },
    ];
  }
  if (stage === 'STAGE_8_12') {
    return [
      {
        title: 'Hipótesis en el parque',
        description: '¿Dónde hay más insectos y por qué? Prueba en 20 min.',
        rationale:
          'Ciclos cortos de pregunta-prueba refuerzan pensamiento experimental.',
        suggestedWeeklyMinutes: 50,
      },
    ];
  }
  return [
    {
      title: 'Proyecto de impacto local',
      description: 'Basura, biodiversidad o agua con entrevista breve a adulto.',
      rationale:
        'Conectar ciencia con ciudadanía aumenta sentido y persistencia.',
      suggestedWeeklyMinutes: 90,
    },
  ];
}

function woodworkingBlocks(stage: AgeStageId): Block[] {
  if (stage === 'STAGE_0_3') {
    return [
      {
        title: 'Exploración de texturas madera-seguras',
        description: 'Piezas grandes, sin astillas; vocabulario de tacto.',
        rationale:
          'A esta edad no hay carpintería formal; solo manipulación supervisada.',
        suggestedWeeklyMinutes: 20,
      },
    ];
  }
  if (stage === 'STAGE_4_7') {
    return [
      {
        title: 'Ensamble precortado',
        description: 'Martillo liviano o ensamble sin filo; checklist de seguridad.',
        rationale:
          'Motricidad fina y secuencia con riesgo controlado.',
        suggestedWeeklyMinutes: 40,
      },
    ];
  }
  if (stage === 'STAGE_8_12') {
    return [
      {
        title: 'Medición y corte asistido',
        description: 'Regla, lápiz, sierra con guía adulta.',
        rationale:
          'Introduce tolerancia y planificación espacial.',
        suggestedWeeklyMinutes: 70,
      },
    ];
  }
  return [
    {
      title: 'Proyecto con plano',
      description: 'Lista de materiales, pasos y revisión de seguridad eléctrica.',
      rationale:
        'Disciplina de taller y lectura técnica son el núcleo de la etapa.',
      suggestedWeeklyMinutes: 120,
    },
  ];
}

function artBlocks(stage: AgeStageId): Block[] {
  if (stage === 'STAGE_0_3') {
    return [
      {
        title: 'Exploración de marcas',
        description: 'Papel grande, duración corta, sin producto “bonito”.',
        rationale:
          'El proceso libre apoya regulación y curiosidad sin evaluación estética prematura.',
        suggestedWeeklyMinutes: 35,
      },
    ];
  }
  if (stage === 'STAGE_4_7') {
    return [
      {
        title: 'Historia dibujada',
        description: 'Viñetas sin reglas de perspectiva.',
        rationale:
          'Narrativa visual conecta emoción y motricidad.',
        suggestedWeeklyMinutes: 40,
      },
    ];
  }
  if (stage === 'STAGE_8_12') {
    return [
      {
        title: 'Serie temática',
        description: 'Cuatro piezas con variación controlada.',
        rationale:
          'La repetición con variación entrena criterio y tolerancia al error.',
        suggestedWeeklyMinutes: 55,
      },
    ];
  }
  return [
    {
      title: 'Portafolio con intención',
      description: 'Selección + texto curatorial breve.',
      rationale:
        'Metacognición sobre propio trabajo es apropiada en adolescencia.',
      suggestedWeeklyMinutes: 80,
    },
  ];
}

function movementBlocks(stage: AgeStageId): Block[] {
  if (stage === 'STAGE_0_3') {
    return [
      {
        title: 'Juego motor con música',
        description: 'Subir/bajar, congelado, rodar pelota.',
        rationale:
          'Ritmo y variación de movimiento apoyan integración sensorial básica.',
        suggestedWeeklyMinutes: 40,
      },
    ];
  }
  if (stage === 'STAGE_4_7') {
    return [
      {
        title: 'Circuito motor en casa',
        description: '4 estaciones, 2 min cada una.',
        rationale:
          'Circuitos cortos mantienen atención y diversidad motriz.',
        suggestedWeeklyMinutes: 35,
      },
    ];
  }
  if (stage === 'STAGE_8_12') {
    return [
      {
        title: 'Hábito semanal + variación',
        description: 'Dos sesiones: técnica + juego.',
        rationale:
          'Balance entre práctica deliberada y disfrute predice adherencia.',
        suggestedWeeklyMinutes: 90,
      },
    ];
  }
  return [
    {
      title: 'Plan personal 4 semanas',
      description: 'Progresión, descanso, registro RPE.',
      rationale:
        'Autonomía con estructura clara es el estándar de esta etapa.',
      suggestedWeeklyMinutes: 150,
    },
  ];
}

function blocksFor(
  categoryId: LearningCategoryId,
  stage: AgeStageId,
): Block[] {
  switch (categoryId) {
    case 'LANGUAGES':
      return languagesBlocks(stage);
    case 'NUTRITION':
      return nutritionBlocks(stage);
    case 'NATURE_CONNECTION':
      return natureBlocks(stage);
    case 'WOODWORKING':
      return woodworkingBlocks(stage);
    case 'ART_CREATIVITY':
      return artBlocks(stage);
    case 'MOVEMENT_BODY':
      return movementBlocks(stage);
    default:
      return [];
  }
}

function summaryFor(categoryId: LearningCategoryId, stage: AgeStageId): string {
  const focus: Record<LearningCategoryId, Record<AgeStageId, string>> = {
    LANGUAGES: {
      STAGE_0_3: 'Exposición, juego y sonido; cero gramática formal.',
      STAGE_4_7: 'Conversación en contexto y narrativa corta.',
      STAGE_8_12: 'Lectura compartida y conversación con metas pequeñas.',
      STAGE_13_18: 'Proyectos comunicativos y escritura revisada.',
    },
    NUTRITION: {
      STAGE_0_3: 'Exploración sensorial y modelado sin presión.',
      STAGE_4_7: 'Cocina guiada y vocabulario corporal.',
      STAGE_8_12: 'Proyectos de lista, compra y hábitos.',
      STAGE_13_18: 'Planificación autónoma y criterios nutricionales.',
    },
    NATURE_CONNECTION: {
      STAGE_0_3: 'Experiencia directa y lenguaje descriptivo.',
      STAGE_4_7: 'Clasificación simple y cuentos del entorno.',
      STAGE_8_12: 'Hipótesis y observación estructurada.',
      STAGE_13_18: 'Proyecto con impacto y evidencia.',
    },
    WOODWORKING: {
      STAGE_0_3: 'Solo exploración táctil supervisada.',
      STAGE_4_7: 'Ensambles precortados y seguridad.',
      STAGE_8_12: 'Medición y proyecto corto asistido.',
      STAGE_13_18: 'Plano, taller y responsabilidad.',
    },
    ART_CREATIVITY: {
      STAGE_0_3: 'Proceso y sensorialidad.',
      STAGE_4_7: 'Narrativa gráfica libre.',
      STAGE_8_12: 'Serie y criterio simple.',
      STAGE_13_18: 'Portafolio y texto reflexivo.',
    },
    MOVEMENT_BODY: {
      STAGE_0_3: 'Juego motor y ritmo.',
      STAGE_4_7: 'Circuitos breves.',
      STAGE_8_12: 'Hábito + técnica ligera.',
      STAGE_13_18: 'Planificación autónoma.',
    },
  };
  return focus[categoryId][stage];
}

/** Plantillas científicas por categoría × etapa (demo seed). */
export const SCIENTIFIC_PLAN_TEMPLATES: ScientificPlanTemplate[] =
  ALL_CATEGORY_IDS.flatMap((categoryId) =>
    AGE_STAGE_ORDER.map((ageStageId) =>
      makeTemplate(
        `tpl-${categoryId}-${ageStageId}`,
        categoryId,
        ageStageId,
        `${LEARNING_CATEGORY_LABELS[categoryId]} · ${AGE_STAGES[ageStageId].label}`,
        summaryFor(categoryId, ageStageId),
        blocksFor(categoryId, ageStageId),
      ),
    ),
  );

export function getTemplate(
  categoryId: LearningCategoryId,
  ageStageId: AgeStageId,
): ScientificPlanTemplate | undefined {
  return SCIENTIFIC_PLAN_TEMPLATES.find(
    (t) => t.categoryId === categoryId && t.ageStageId === ageStageId,
  );
}
