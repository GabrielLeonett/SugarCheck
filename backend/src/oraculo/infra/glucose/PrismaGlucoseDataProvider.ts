import { Injectable } from '@nestjs/common';
import { GlucoseDataProvider } from '../../app/ports/GlucoseDataProvider';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

interface Thresholds {
  hypo?: number;
  hiper?: number;
}

@Injectable()
export class PrismaGlucoseDataProvider implements GlucoseDataProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getContext(userId: string): Promise<Result<string, ErrorAbstract>> {
    try {
      const latest = await this.prisma.glucose.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      if (!latest) {
        return Result.ok('Aún no tienes registros de glucosa recientes.');
      }

      const since = new Date();
      since.setDate(since.getDate() - 7);

      const recent = await this.prisma.glucose.findMany({
        where: { userId, date: { gte: since } },
      });

      const values = recent.map((r) => r.valueMgdl);
      const avg = values.length
        ? Math.round(values.reduce((acc, v) => acc + v, 0) / values.length)
        : null;

      const preference = await this.prisma.preference.findUnique({ where: { userId } });
      const thresholds = (preference?.thresholds ?? {}) as Thresholds;

      const parts = [
        `Último registro: ${latest.valueMgdl} mg/dL (${latest.mealTag})`,
        avg !== null ? `Promedio últimos 7 días: ${avg} mg/dL` : null,
      ].filter((p): p is string => Boolean(p));

      if (thresholds.hypo !== undefined && thresholds.hiper !== undefined) {
        parts.push(`Rango objetivo: ${thresholds.hypo}–${thresholds.hiper} mg/dL`);
      }

      return Result.ok(parts.join('. ') + '.');
    } catch {
      return Result.ok('Aún no tienes registros de glucosa recientes.');
    }
  }
}
