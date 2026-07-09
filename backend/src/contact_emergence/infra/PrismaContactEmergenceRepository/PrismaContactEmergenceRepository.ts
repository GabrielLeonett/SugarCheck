import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ContactEmergence } from '../../core/ContactEmergence';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { ContactEmergenceRepository } from '../../core/ContactEmergenceRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ContactEmergenceId } from '../../core/value-objects/ContactEmergenceId';
import { ContactName } from '../../core/value-objects/ContactName';
import { ContactParentesco } from '../../core/value-objects/ContactParentesco';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { ContactNotFoundError } from '../../core/errors/ContactNotFoundError';

interface ContactEmergenceDB {
  id: string;
  userId: string;
  name: string;
  parentesco: string;
  telefono: string | null;
}

@Injectable()
export class PrismaContactEmergenceRepository implements ContactEmergenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: ContactEmergenceDB): ContactEmergence {
    return new ContactEmergence({
      id: ContactEmergenceId.create(raw.id).getValue(),
      userId: UserId.create(raw.userId).getValue(),
      name: ContactName.create(raw.name).getValue(),
      parentesco: ContactParentesco.create(raw.parentesco).getValue(),
      telefono: raw.telefono ?? undefined,
    });
  }

  private toPersistence(contact: ContactEmergence): ContactEmergenceDB {
    return {
      id: contact.id.value,
      userId: contact.userId.value,
      name: contact.name.value,
      parentesco: contact.parentesco.value,
      telefono: contact.telefono ?? null,
    };
  }

  async getAllByUserId(userId: UserId): Promise<Result<ContactEmergence[], ErrorAbstract>> {
    try {
      const contacts = await this.prisma.contactEmergence.findMany({
        where: { userId: userId.value },
      });
      return Result.ok(contacts.map((c) => this.toDomain(c)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error al obtener los contactos de emergencia'),
      );
    }
  }

  async getOneById(id: ContactEmergenceId): Promise<Result<ContactEmergence, ErrorAbstract>> {
    try {
      const contact = await this.prisma.contactEmergence.findUnique({
        where: { id: id.value },
      });
      if (!contact) {
        return Result.fail(
          new ContactNotFoundError(`Contacto con ID ${id.value} no encontrado`),
        );
      }
      return Result.ok(this.toDomain(contact));
    } catch (error) {
      return Result.fail(new DatabaseError('Error técnico al buscar contacto por ID'));
    }
  }

  async save(contact: ContactEmergence): Promise<Result<ContactEmergence, ErrorAbstract>> {
    try {
      const saved = await this.prisma.contactEmergence.create({
        data: this.toPersistence(contact),
      });
      return Result.ok(this.toDomain(saved));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return Result.fail(
          new DatabaseError('El usuario asociado no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error crítico al guardar el contacto de emergencia'),
      );
    }
  }

  async update(id: ContactEmergenceId, update: Partial<ContactEmergence>): Promise<Result<ContactEmergence, ErrorAbstract>> {
    try {
      const data: any = {};
      if (update.name) data.name = update.name.value;
      if (update.parentesco) data.parentesco = update.parentesco.value;
      if (update.telefono !== undefined) data.telefono = update.telefono;

      await this.prisma.contactEmergence.update({
        where: { id: id.value },
        data,
      });
      return await this.getOneById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new ContactNotFoundError('No se pudo actualizar: el contacto no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al actualizar el contacto de emergencia'),
      );
    }
  }

  async delete(id: ContactEmergenceId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.contactEmergence.delete({
        where: { id: id.value },
      });
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return Result.fail(
          new ContactNotFoundError('No se pudo eliminar: el contacto no existe'),
        );
      }
      return Result.fail(
        new DatabaseError('Error al eliminar el contacto de emergencia'),
      );
    }
  }
}
