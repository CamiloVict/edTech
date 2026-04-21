import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  Prisma,
  SupportResolutionRule,
} from '@repo/database';

export type ResolutionContext = {
  categoryCode: string;
  metadata: Record<string, unknown>;
  appointment: {
    status: AppointmentStatus;
    startsAt: Date;
    endsAt: Date;
  };
  now: Date;
  /** 0–1, más alto = más riesgo de abuso (baja confianza en auto). */
  abuseScore: number;
};

export type ResolutionOutcome = {
  actionType: string;
  actionPayload: Prisma.JsonValue | null;
  autoConfidence: number;
  ruleId: string | null;
  ruleName: string | null;
};

const DEFAULT_THRESHOLD = 0.55;

@Injectable()
export class SupportResolutionService {
  /**
   * Evalúa reglas por `priority` descendente; la primera cuyo `conditionsJson` cumpla gana.
   */
  evaluate(
    rules: SupportResolutionRule[],
    ctx: ResolutionContext,
  ): ResolutionOutcome | null {
    const sorted = [...rules].sort((a, b) => b.priority - a.priority);
    for (const rule of sorted) {
      if (rule.categoryCode !== ctx.categoryCode) continue;
      if (!this.conditionsMatch(rule.conditionsJson, ctx)) continue;
      const base = Number(rule.autoConfidence);
      const adjusted = Math.max(0, Math.min(1, base * (1 - ctx.abuseScore * 0.35)));
      return {
        actionType: rule.actionType,
        actionPayload: rule.actionPayload ?? null,
        autoConfidence: adjusted,
        ruleId: rule.id,
        ruleName: rule.name,
      };
    }
    return null;
  }

  shouldEscalateAction(actionType: string): boolean {
    return actionType === 'ESCALATE';
  }

  autoThreshold(): number {
    const raw = process.env.SUPPORT_AUTO_CONFIDENCE_THRESHOLD;
    const n = raw != null ? Number(raw) : DEFAULT_THRESHOLD;
    return Number.isFinite(n) && n > 0 && n < 1 ? n : DEFAULT_THRESHOLD;
  }

  private conditionsMatch(
    raw: Prisma.JsonValue,
    ctx: ResolutionContext,
  ): boolean {
    const c = raw as Record<string, unknown>;
    if (Object.keys(c).length === 0) return true;

    const maxMin = c.maxActualMinutes;
    if (typeof maxMin === 'number') {
      const reported = ctx.metadata.sessionActualMinutes;
      if (typeof reported !== 'number') return false;
      if (reported > maxMin) return false;
    }

    const minPlannedMinutes = c.minPlannedMinutes;
    if (typeof minPlannedMinutes === 'number') {
      const plannedMs =
        ctx.appointment.endsAt.getTime() - ctx.appointment.startsAt.getTime();
      const plannedMin = plannedMs / 60000;
      if (plannedMin < minPlannedMinutes) return false;
    }

    return true;
  }
}
