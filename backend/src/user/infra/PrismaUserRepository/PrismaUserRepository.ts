// src/user/infrastructure/PrismaUserRepository.ts
import { Injectable } from '@nestjs/common';
import { User } from '../../core/User';
import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { DatabaseError } from '../../../shared/DatabaseError';
import { UserRepository } from '../../core/UserRepository';
import { PrismaService } from '../../../shared/prisma.service';
import { UserId } from '../../core/value-objects/UserId';
import { UserName } from '../../core/value-objects/UserName';
import { UserEmail } from '../../core/value-objects/UserEmail';
import { UserRoles } from '../../core/value-objects/UserRoles';
import { UserCreatedAt } from '../../core/value-objects/UserCreatedAt';

interface UserDB {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: UserDB): User {
    return new User({
      id: UserId.create(raw.id).getValue(),
      name: UserName.create(raw.name).getValue(),
      email: UserEmail.create(raw.email).getValue(),
      roles: UserRoles.create(raw.roles).getValue(),
      createdAt: UserCreatedAt.create(raw.createdAt).getValue(),
    });
  }

  private toPersistence(user: User): UserDB {
    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      roles: user.roles.value,
      createdAt: user.createdAt.value,
    };
  }

  async getAll(): Promise<Result<User[], ErrorAbstract>> {
    try {
      const users = await this.prisma.user.findMany();
      const domainUsers = users.map((user) => this.toDomain(user));
      return Result.ok(domainUsers);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Result.fail(new DatabaseError('Error al obtener usuarios'));
    }
  }

  async getOneByEmail(
    email: UserEmail,
  ): Promise<Result<User | null, ErrorAbstract>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.value },
      });

      if (!user) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(user));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error al buscar usuario por email'),
      );
    }
  }

  async getOneById(id: UserId): Promise<Result<User | null, ErrorAbstract>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id.value },
      });

      if (!user) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(user));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Result.fail(new DatabaseError('Error al buscar usuario por ID'));
    }
  }

  async save(user: User): Promise<Result<User, ErrorAbstract>> {
    try {
      const userData = this.toPersistence(user);

      const savedUser = await this.prisma.user.create({
        data: userData,
      });

      return Result.ok(this.toDomain(savedUser));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Result.fail(new DatabaseError('Error al guardar usuario'));
    }
  }

  async delete(id: UserId): Promise<Result<void, ErrorAbstract>> {
    try {
      await this.prisma.user.delete({
        where: { id: id.value },
      });

      return Result.ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return Result.fail(new DatabaseError('Error al eliminar usuario'));
    }
  }
}
