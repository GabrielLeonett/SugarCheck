import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Glucose } from '../../core/Glucose';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { GlucoseRepository } from '../../core/GlucoseRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GlucoseId } from '../../core/value-objects/GlucoseId';
import { GlucoseValue } from '../../core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../../core/value-objects/GlucoseMealTag';
import { GlucoseDate } from '../../core/value-objects/GlucoseDate';
import { GlucoseTime } from '../../core/value-objects/GlucoseTime';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { GlucoseNotFoundError } from '../../core/errors/GlucoseNotFoundError';

interface GlucoseDB {
  id: string;
  userId: string;
  valueMgdl: number;
  mealTag: string;
  date: Date;
  time: string;
  createdAt: Date;
}

@Injectable()
export class PrismaGlucoseRepository implements GlucoseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: GlucoseDB): Glucose {
    return new Glucose({
      id: GlucoseId.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      valueMgdl: GlucoseValue.create(raw.valueMgdl).getValue(),
      mealTag: GlucoseMealTag.create(raw.mealTag).getValue(),
      date: GlucoseDate.create(raw.date).getValue(),
      time: GlucoseTime.create(raw.time).getValue(),
      createdAt: raw.createdAt,
    });
  }

  private toPersistence(glucose: Glucose): GlucoseDB {
    return {
      id: glucose.id.value,
      userId: glucose.userId.value,
      valueMgdl: glucose.valueMgdl.value,
      mealTag: glucose.mealTag.value,
      date: glucose.date.value,
      time: glucose.time.value,
      createdAt: glucose.createdAt,
    };
  }

  async getAllByUserId(userId: UserId): Promise<Result<Glucose[], ErrorAbstract>> {
    try {
      const records = await this.prisma.glucose.findMany({
        where: { userId: userId.value },
        orderBy: { date: 'desc' },
      });
      return Result.ok(records.map((r) => this.toDomain(r)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error al obtener los registros de glucosa'),
      );
    }
  }

  async getOneById(id: GlucoseId): Promise<Result<Glucose, ErrorAbstract>> {
    try {
      const record = await this.prisma.glucose.findUnique({
        where: { id: id.value },
      });
      if (!record) {
        return Result.fail(
          new GlucoseNotFoundError(`Registro de glucosa con ID ${id.value} no encontrado`),
        );
      }
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(new DatabaseError('Error técnico al buscar glucosa por ID'));
    }
  }

  async save(glucose: Glucose): Promise<Result<Glucose, ErrorAbstract>> {
    try {
      const saved = await this.prisma.glucose.create({
        data: this.toPersistence(glucose),
      });
      return Result.ok(this.toDomain(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(
          new DatabaseError('El usuario asociado no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error crítico al guardar el registro de glucosa'),
      );
    }
  }

  async update(id: GlucoseId, update: Partial<Glucose>): Promise<Result<Glucose, ErrorAbstract>> {
    try {
      const data: any = {};
      if (update.valueMgdl) {
        data.valueMgdl = update.valueMgdl.value;
      }
      if (update.mealTag) {
        data.mealTag = update.mealTag.value;
      }

      await this.prisma.glucose.update({
        where: { id: id.value },
        data,
      });
      return await this.getOneById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new GlucoseNotFoundError('No se pudo actualizar: el registro de glucosa no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al actualizar el registro de glucosa'),
      );
    }
  }

  async delete(id: GlucoseId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.glucose.delete({
        where: { id: id.value },
      });
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new GlucoseNotFoundError('No se pudo eliminar: el registro de glucosa no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al eliminar el registro de glucosa'),
      );
    }
  }
}
