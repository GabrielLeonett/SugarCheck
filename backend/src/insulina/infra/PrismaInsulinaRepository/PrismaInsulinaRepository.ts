import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Insulina } from '../../core/Insulina';
import { InsulinaRepository } from '../../core/InsulinaRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IdInsulina } from '../../core/value-objects/IdInsulina';
import { TipoInsulina } from '../../core/value-objects/TipoInsulina';
import { Dosis } from '../../core/value-objects/Dosis';
import { ZonaInyeccion } from '../../core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../../core/value-objects/ContextoAplicacion';
import { FechaInsulina } from '../../core/value-objects/FechaInsulina';
import { HoraInsulina } from '../../core/value-objects/HoraInsulina';
import { InsulinaNotFoundError } from '../../core/errors/InsulinaNotFoundError';
import { DatabaseError } from '../../../shared/DatabaseError';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

interface InsulinaDB {
  id: string;
  userId: string;
  tipo: string;
  dosis: number;
  unidades: number;
  fecha: Date;
  hora: string;
  zona: string;
  contexto: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaInsulinaRepository implements InsulinaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: InsulinaDB): Result<Insulina, ErrorAbstract> {
    const idRes = IdInsulina.create(raw.id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const tipoRes = TipoInsulina.create(raw.tipo);
    if (!tipoRes.isValid) return Result.fail(tipoRes.getError());

    const dosisRes = Dosis.create(raw.dosis);
    if (!dosisRes.isValid) return Result.fail(dosisRes.getError());

    const fechaRes = FechaInsulina.create(
      raw.fecha.getDate(),
      raw.fecha.getMonth() + 1,
      raw.fecha.getFullYear(),
    );
    if (!fechaRes.isValid) return Result.fail(fechaRes.getError());

    const horaRes = HoraInsulina.create(raw.hora);
    if (!horaRes.isValid) return Result.fail(horaRes.getError());

    const zonaRes = ZonaInyeccion.create(raw.zona);
    if (!zonaRes.isValid) return Result.fail(zonaRes.getError());

    let contexto: ContextoAplicacion | null = null;
    if (raw.contexto) {
      const ctxRes = ContextoAplicacion.create(raw.contexto);
      if (!ctxRes.isValid) return Result.fail(ctxRes.getError());
      contexto = ctxRes.getValue();
    }

    return Result.ok(new Insulina({
      id: idRes.getValue(),
      userId: raw.userId,
      tipo: tipoRes.getValue(),
      dosis: dosisRes.getValue(),
      fecha: fechaRes.getValue(),
      hora: horaRes.getValue(),
      zona: zonaRes.getValue(),
      contexto,
      createdAt: raw.createdAt,
    }));
  }

  async getAllByUserId(userId: string): Promise<Result<Insulina[], ErrorAbstract>> {
    try {
      const records = await this.prisma.insulina.findMany({
        where: { userId },
        orderBy: { fecha: 'desc' },
      });

      const insulinas: Insulina[] = [];
      for (const r of records) {
        const domainRes = this.toDomain(r);
        if (!domainRes.isValid) return Result.fail(domainRes.getError());
        insulinas.push(domainRes.getValue());
      }
      return Result.ok(insulinas);
    } catch (error) {
      console.error('Error en getAllByUserId:', error);
      return Result.fail(new DatabaseError('Error al obtener registros de insulina'));
    }
  }

  async getById(id: IdInsulina): Promise<Result<Insulina | null, ErrorAbstract>> {
    try {
      const record = await this.prisma.insulina.findUnique({
        where: { id: id.value },
      });
      if (!record) {
        return Result.ok(null);
      }
      return this.toDomain(record);
    } catch (error) {
      console.error('Error en getById:', error);
      return Result.fail(new DatabaseError('Error al buscar registro de insulina'));
    }
  }

  async save(entity: Insulina): Promise<Result<Insulina, ErrorAbstract>> {
    try {
      const saved = await this.prisma.insulina.create({
        data: {
          id: entity.id.value,
          userId: entity.userId,
          tipo: entity.tipo.toString(),
          dosis: entity.dosis.value,
          unidades: entity.dosis.value,
          fecha: entity.fecha.value,
          hora: entity.hora.toString(),
          zona: entity.zona.toString(),
          contexto: entity.contexto?.toString() || null,
        },
      });
      const domainRes = this.toDomain(saved);
      if (!domainRes.isValid) return Result.fail(domainRes.getError());
      return Result.ok(domainRes.getValue());
    } catch (error) {
      console.error('Error en save:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(new DatabaseError('El usuario asociado no existe'));
      }
      return Result.fail(new DatabaseError('Error crítico al guardar registro de insulina'));
    }
  }

  async update(id: IdInsulina, data: Partial<Insulina>): Promise<Result<Insulina, ErrorAbstract>> {
    try {
      const updateData: any = {};

      if (data.dosis !== undefined) {
        updateData.dosis = (data.dosis as any).value;
        updateData.unidades = (data.dosis as any).value;
      }
      if (data.fecha !== undefined) {
        updateData.fecha = (data.fecha as any).value;
      }
      if (data.hora !== undefined) {
        updateData.hora = (data.hora as any).toString();
      }
      if (data.zona !== undefined) {
        updateData.zona = (data.zona as any).toString();
      }
      if (data.contexto !== undefined) {
        updateData.contexto = (data.contexto as any)?.toString() || null;
      }

      const updated = await this.prisma.insulina.update({
        where: { id: id.value },
        data: updateData,
      });

      const domainRes = this.toDomain(updated);
      if (!domainRes.isValid) return Result.fail(domainRes.getError());
      return Result.ok(domainRes.getValue());
    } catch (error) {
      console.error('Error en update:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(new DatabaseError('No se pudo actualizar: el registro de insulina no existe'));
      }
      return Result.fail(new DatabaseError('Error al actualizar registro de insulina'));
    }
  }

  async delete(id: IdInsulina): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.insulina.delete({
        where: { id: id.value },
      });
      return Result.ok(undefined);
    } catch (error) {
      console.error('Error en delete:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(new DatabaseError('No se pudo eliminar: el registro de insulina no existe'));
      }
      return Result.fail(new DatabaseError('Error al eliminar registro de insulina'));
    }
  }

  async getByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Result<Insulina[], ErrorAbstract>> {
    try {
      const records = await this.prisma.insulina.findMany({
        where: {
          userId,
          fecha: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { fecha: 'desc' },
      });

      const insulinas: Insulina[] = [];
      for (const r of records) {
        const domainRes = this.toDomain(r);
        if (!domainRes.isValid) return Result.fail(domainRes.getError());
        insulinas.push(domainRes.getValue());
      }
      return Result.ok(insulinas);
    } catch (error) {
      console.error('Error en getByUserIdAndDateRange:', error);
      return Result.fail(new DatabaseError('Error al obtener registros de insulina por rango de fechas'));
    }
  }

  async getTotalByUserIdAndDate(userId: string, date: Date): Promise<Result<{ totalRapida: number; totalLenta: number }, ErrorAbstract>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await this.prisma.insulina.findMany({
        where: {
          userId,
          fecha: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      let totalRapida = 0;
      let totalLenta = 0;

      for (const record of records) {
        if (record.tipo === 'RAPIDA') {
          totalRapida += record.dosis;
        } else {
          totalLenta += record.dosis;
        }
      }

      return Result.ok({ totalRapida, totalLenta });
    } catch (error) {
      console.error('Error en getTotalByUserIdAndDate:', error);
      return Result.fail(new DatabaseError('Error al calcular totales de insulina'));
    }
  }
}