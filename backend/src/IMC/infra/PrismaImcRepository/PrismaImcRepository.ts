import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Imc } from '../../core/Imc';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { ImcRepository } from '../../core/ImcRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { Id_IMC } from '../../core/value-objects/Id_IMC';
import { Peso } from '../../core/value-objects/peso';
import { Altura } from '../../core/value-objects/altura';
import { Fecha } from '../../core/value-objects/Fecha';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { ImcNotFoundError } from '../../core/errors/ImcNotFoundError';

interface ImcDB {
  id: string;
  userId: string;
  peso: number;
  altura: number;
  imcValue: number;
  fecha: Date;
}

@Injectable()
export class PrismaImcRepository implements ImcRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: ImcDB): Imc {
    return new Imc({
      id: Id_IMC.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      peso: Peso.create(raw.peso).getValue(),
      altura: Altura.create(raw.altura).getValue(),
      fecha: Fecha.fromDate(raw.fecha).getValue(),
    });
  }

  private toPersistence(imc: Imc): ImcDB {
    return {
      id: imc.id.value,
      userId: imc.userId.value,
      peso: imc.peso.value,
      altura: imc.altura.value,
      imcValue: imc.imcValue,
      fecha: imc.fecha.valor,
    };
  }

  async getAllByUserId(userId: UserId): Promise<Result<Imc[], ErrorAbstract>> {
    try {
      const records = await this.prisma.imc.findMany({
        where: { userId: userId.value },
        orderBy: { fecha: 'desc' },
      });
      return Result.ok(records.map((r) => this.toDomain(r)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error al obtener los registros de IMC'),
      );
    }
  }

  async getOneById(id: Id_IMC): Promise<Result<Imc, ErrorAbstract>> {
    try {
      const record = await this.prisma.imc.findUnique({
        where: { id: id.value },
      });
      if (!record) {
        return Result.fail(
          new ImcNotFoundError(`Registro IMC con ID ${id.value} no encontrado`),
        );
      }
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(new DatabaseError('Error técnico al buscar IMC por ID'));
    }
  }

  async save(imc: Imc): Promise<Result<Imc, ErrorAbstract>> {
    try {
      const saved = await this.prisma.imc.create({
        data: this.toPersistence(imc),
      });
      return Result.ok(this.toDomain(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(
          new DatabaseError('El usuario asociado no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error crítico al guardar el registro de IMC'),
      );
    }
  }

  async update(id: Id_IMC, update: Partial<Imc>): Promise<Result<Imc, ErrorAbstract>> {
    try {
      const data: any = {};
      if (update.peso) {
        data.peso = update.peso.value;
        data.imcValue = undefined;
      }
      if (update.altura) {
        data.altura = update.altura.value;
        data.imcValue = undefined;
      }

      await this.prisma.imc.update({
        where: { id: id.value },
        data,
      });
      return await this.getOneById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new ImcNotFoundError('No se pudo actualizar: el registro IMC no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al actualizar el registro de IMC'),
      );
    }
  }

  async delete(id: Id_IMC): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.imc.delete({
        where: { id: id.value },
      });
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new ImcNotFoundError('No se pudo eliminar: el registro IMC no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al eliminar el registro de IMC'),
      );
    }
  }
}
