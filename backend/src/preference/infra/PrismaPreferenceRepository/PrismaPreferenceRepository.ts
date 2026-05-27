import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PreferenceRepository } from '../../core/PreferenceRepository';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { Preference } from '../../core/Preference';
import { UserId } from '../../../shared/core/value-objects/UserId';
import { UnitMeasure } from '../../core/value-objects/UnitMeasure';
import { Thresholds } from '../../core/value-objects/Thresholds';
import { InsulinRatios } from '../../core/value-objects/InsulinRatios';
import { SensitivityFactor } from '../../core/value-objects/SensitivityFactor';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { DatabaseError } from '../../../shared/DatabaseError';

// Interfaz que refleja tu modelo en Prisma (asumiendo campos JSON para los objetos anidados)
interface PreferenceDB {
  userId: string;
  unitMeasure: string;
  thresholds: Prisma.JsonValue;
  insulinRatios: Prisma.JsonValue;
  sensitivity: number;
}

@Injectable()
export class PrismaPreferenceRepository implements PreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- MAPPERS ---

  private toDomain(raw: any): Preference {
    const id = UserId.create(raw.userId).getValue();
    const unitMeasure = UnitMeasure.create(raw.unitMeasure).getValue();
    const thresholds = Thresholds.create(raw.thresholds as any).getValue();
    const insulinRatios = InsulinRatios.create(
      raw.insulinRatios.breakfast,
      raw.insulinRatios.lunch,
      raw.insulinRatios.dinner,
    ).getValue();
    const sensitivity = SensitivityFactor.create(raw.sensitivity).getValue();

    return new Preference({
      userId: id,
      unitMeasure,
      thresholds,
      insulinRatios,
      sensitivity,
    });
  }

  private toPersistence(preference: Preference): any {
    return {
      userId: preference.userId.value,
      unitMeasure: preference.unitMeasure.value,
      thresholds: preference.thresholds.value,
      insulinRatios: preference.insulinRatios,
      sensitivity: preference.sensitivity.value,
    };
  }

  // --- MÉTODOS DEL REPOSITORIO ---

  async getOneById(id: UserId): Promise<Result<Preference, ErrorAbstract>> {
    try {
      // Usamos userId como llave primaria o identificador único
      const preference = await this.prisma.preference.findUnique({
        where: { userId: id.value },
      });

      return Result.ok(this.toDomain(preference));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error técnico al buscar las preferencias'),
      );
    }
  }

  async save(
    preference: Preference,
  ): Promise<Result<Preference, ErrorAbstract>> {
    try {
      // Usamos upsert: Si no existe la crea, si existe la ignora o actualiza
      // Esto es ideal para configuraciones 1 a 1 con el usuario.
      const savedPreference = await this.prisma.preference.upsert({
        where: { userId: preference.userId.value },
        update: this.toPersistence(preference),
        create: this.toPersistence(preference),
      });

      return Result.ok(this.toDomain(savedPreference));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error crítico al intentar guardar las preferencias'),
      );
    }
  }
}
