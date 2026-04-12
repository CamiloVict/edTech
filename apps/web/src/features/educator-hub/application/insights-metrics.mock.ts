import type { EducatorMetric } from '../domain/types';

/** Métricas de la pantalla Insights — datos demo. */
export function buildEducatorInsightsMetrics(): EducatorMetric[] {
  return [
    {
      id: 'm_views',
      label: 'Visitas al perfil (30 días)',
      value: '1.284',
      deltaLabel: '+12% vs mes anterior',
      trend: 'up',
    },
    {
      id: 'm_conv',
      label: 'Conversión visita → reserva',
      value: '3,4%',
      deltaLabel: 'Objetivo plataforma 4%',
      trend: 'flat',
    },
    {
      id: 'm_resp',
      label: 'Tiempo de respuesta medio',
      value: '5 h',
      deltaLabel: 'Excelente (< 24 h)',
      trend: 'up',
    },
    {
      id: 'm_reviews',
      label: 'Reseñas nuevas',
      value: '6',
      deltaLabel: 'Últimos 30 días',
      trend: 'up',
    },
    {
      id: 'm_ret',
      label: 'Retención (90 días)',
      value: '72%',
      deltaLabel: 'Familias que repiten',
      trend: 'flat',
    },
    {
      id: 'm_top_age',
      label: 'Edad con más demanda',
      value: '4–7 años',
      deltaLabel: 'Coincide con tus talleres',
      trend: 'up',
    },
  ];
}
