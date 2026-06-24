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
import { ProfileImg } from '../../core/value-objects/ProfileImg';
import { Locale } from '../../core/value-objects/Locale';
import { Theme } from '../../core/value-objects/Theme';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { DatabaseError } from '../../../shared/DatabaseError';

@Injectable()
export class PrismaPreferenceRepository implements PreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- MAPPERS ---

  private toDomain(raw: any): Preference {
    // Nota: Aquí se asume que los VO tienen métodos estáticos create que retornan un Result
    return new Preference({
      userId: UserId.create(raw.userId).getValue(),
      profileImg: ProfileImg.create(raw.profileImg).getValue(),
      unitMeasure: UnitMeasure.create(raw.unitMeasure).getValue(),
      thresholds: Thresholds.create(raw.thresholds).getValue(),
      insulinRatios: InsulinRatios.create(
        raw.insulinRatios.breakfast,
        raw.insulinRatios.lunch,
        raw.insulinRatios.dinner,
      ).getValue(),
      sensitivity: SensitivityFactor.create(raw.sensitivity).getValue(),
      locale: Locale.create(raw.locale).getValue(),
      theme: Theme.create(raw.theme).getValue(),
    });
  }

  private toPersistence(preference: Preference): any {
    return {
      userId: preference.userId.value,
      profileImg: preference.profileImg.value,
      unitMeasure: preference.unitMeasure.value,
      thresholds: preference.thresholds.value,
      insulinRatios: {
        breakfast: preference.insulinRatios.breakfast,
        lunch: preference.insulinRatios.lunch,
        dinner: preference.insulinRatios.dinner,
      },
      sensitivity: preference.sensitivity.value,
      locale: preference.locale.value,
      theme: preference.theme.value,
    };
  }

  // --- MÉTODOS DEL REPOSITORIO ---

  async getOneById(id: UserId): Promise<Result<Preference, ErrorAbstract>> {
    try {
      const preference = await this.prisma.preference.findUnique({
        where: { userId: id.value },
      });

      if (!preference) {
        return Result.fail(new DatabaseError('Preferencia no encontrada'));
      }

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
      const data = this.toPersistence(preference);
      const savedPreference = await this.prisma.preference.upsert({
        where: { userId: data.userId },
        update: data,
        create: data,
      });

      return Result.ok(this.toDomain(savedPreference));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Error crítico al intentar guardar las preferencias'),
      );
    }
  }
}