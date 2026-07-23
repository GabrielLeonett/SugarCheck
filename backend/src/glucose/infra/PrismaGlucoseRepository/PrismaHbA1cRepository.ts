import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HbA1c } from '../../core/HbA1c';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { HbA1cRepository } from '../../core/HbA1cRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { HbA1cId } from '../../core/value-objects/HbA1cId';
import { HbA1cValue } from '../../core/value-objects/HbA1cValue';
import { HbA1cExamDate } from '../../core/value-objects/HbA1cExamDate';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { HbA1cNotFoundError } from '../../core/errors/HbA1cNotFoundError';

interface HbA1cDB {
  id: string;
  userId: string;
  valuePercent: number;
  examDate: Date;
  createdAt: Date;
}

@Injectable()
export class PrismaHbA1cRepository implements HbA1cRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: HbA1cDB): HbA1c {
    return new HbA1c({
      id: HbA1cId.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      valuePercent: HbA1cValue.create(raw.valuePercent).getValue(),
      examDate: HbA1cExamDate.create(raw.examDate).getValue(),
      createdAt: raw.createdAt,
    });
  }

  private toPersistence(hba1c: HbA1c): HbA1cDB {
    return {
      id: hba1c.id.value,
      userId: hba1c.userId.value,
      valuePercent: hba1c.valuePercent.value,
      examDate: hba1c.examDate.value,
      createdAt: hba1c.createdAt,
    };
  }

  async getAllByUserId(userId: UserId): Promise<Result<HbA1c[], ErrorAbstract>> {
    try {
      const records = await this.prisma.hbA1c.findMany({
        where: { userId: userId.value },
        orderBy: { examDate: 'desc' },
      });
      return Result.ok(records.map((r) => this.toDomain(r)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error al obtener los registros de HbA1c'),
      );
    }
  }

  async getOneById(id: HbA1cId): Promise<Result<HbA1c, ErrorAbstract>> {
    try {
      const record = await this.prisma.hbA1c.findUnique({
        where: { id: id.value },
      });
      if (!record) {
        return Result.fail(
          new HbA1cNotFoundError(`Examen HbA1c con ID ${id.value} no encontrado`),
        );
      }
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(new DatabaseError('Error técnico al buscar HbA1c por ID'));
    }
  }

  async save(hba1c: HbA1c): Promise<Result<HbA1c, ErrorAbstract>> {
    try {
      const saved = await this.prisma.hbA1c.create({
        data: this.toPersistence(hba1c),
      });
      return Result.ok(this.toDomain(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(
          new DatabaseError('El usuario asociado no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error crítico al guardar el registro de HbA1c'),
      );
    }
  }

  async update(id: HbA1cId, update: Partial<HbA1c>): Promise<Result<HbA1c, ErrorAbstract>> {
    try {
      const data: any = {};
      if (update.valuePercent) {
        data.valuePercent = update.valuePercent.value;
      }

      await this.prisma.hbA1c.update({
        where: { id: id.value },
        data,
      });
      return await this.getOneById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new HbA1cNotFoundError('No se pudo actualizar: el examen HbA1c no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al actualizar el registro de HbA1c'),
      );
    }
  }

  async delete(id: HbA1cId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.hbA1c.delete({
        where: { id: id.value },
      });
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new HbA1cNotFoundError('No se pudo eliminar: el examen HbA1c no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al eliminar el registro de HbA1c'),
      );
    }
  }
}
