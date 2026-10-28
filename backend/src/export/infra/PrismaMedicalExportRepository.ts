import { Injectable } from '@nestjs/common';
import { ErrorAbstract } from '../../shared/error-abstract';
import { DatabaseError } from '../../shared/DatabaseError';
import { Result } from '../../shared/result';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { UserNotFoundError } from '../../user/core/errors/UserNotFoundError';
import {
  ExportGlucoseRecord,
  ExportHbA1cRecord,
  ExportImcRecord,
  ExportInsulinRecord,
  MedicalExportData,
  MedicalExportPeriod,
} from '../core/MedicalExportData';
import { MedicalExportRepository } from '../core/MedicalExportRepository';

interface DateRange {
  gte?: Date;
  lte?: Date;
}

@Injectable()
export class PrismaMedicalExportRepository implements MedicalExportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMedicalData(
    userId: string,
    period: MedicalExportPeriod,
  ): Promise<Result<MedicalExportData, ErrorAbstract>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, username: true },
      });

      if (!user) {
        return Result.fail(
          new UserNotFoundError(`Usuario con ID ${userId} no encontrado`),
        );
      }

      const range = this.buildDateRange(period);

      const [glucose, hba1c, insulin, imc] = await Promise.all([
        this.prisma.glucose.findMany({
          where: this.withDateRange(
            { userId, deletedAt: null },
            'date',
            range,
          ),
          orderBy: { date: 'desc' },
          select: {
            date: true,
            time: true,
            valueMgdl: true,
            mealTag: true,
          },
        }),
        this.prisma.hbA1c.findMany({
          where: this.withDateRange(
            { userId, deletedAt: null },
            'examDate',
            range,
          ),
          orderBy: { examDate: 'desc' },
          select: {
            examDate: true,
            valuePercent: true,
          },
        }),
        this.prisma.insulina.findMany({
          where: this.withDateRange(
            { userId, deletedAt: null },
            'fecha',
            range,
          ),
          orderBy: { fecha: 'desc' },
          select: {
            fecha: true,
            hora: true,
            tipo: true,
            dosis: true,
            zona: true,
            contexto: true,
          },
        }),
        this.prisma.imc.findMany({
          where: this.withDateRange(
            { userId, deletedAt: null },
            'fecha',
            range,
          ),
          orderBy: { fecha: 'desc' },
          select: {
            fecha: true,
            peso: true,
            altura: true,
            imcValue: true,
          },
        }),
      ]);

      return Result.ok({
        patient: user,
        period,
        generatedAt: new Date(),
        glucose: glucose as ExportGlucoseRecord[],
        hba1c: hba1c as ExportHbA1cRecord[],
        insulin: insulin as ExportInsulinRecord[],
        imc: imc as ExportImcRecord[],
      });
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Error al obtener los datos médicos para exportar',
        ),
      );
    }
  }

  private buildDateRange(period: MedicalExportPeriod): DateRange | undefined {
    if (!period.from && !period.to) return undefined;

    const range: DateRange = {};
    if (period.from) range.gte = period.from;
    if (period.to) range.lte = period.to;
    return range;
  }

  private withDateRange(
    where: Record<string, unknown>,
    field: 'date' | 'examDate' | 'fecha',
    range?: DateRange,
  ): Record<string, unknown> {
    return range ? { ...where, [field]: range } : where;
  }
}
