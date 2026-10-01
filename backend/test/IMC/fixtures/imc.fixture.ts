import { faker } from '@faker-js/faker';
import { Imc } from '../../../src/IMC/core/Imc';
import { Id_IMC } from '../../../src/IMC/core/value-objects/Id_IMC';
import { Peso } from '../../../src/IMC/core/value-objects/peso';
import { Altura } from '../../../src/IMC/core/value-objects/altura';
import { Fecha } from '../../../src/IMC/core/value-objects/Fecha';
import { UserId } from '../../../src/shared/core/value-objects/UserId';

interface ImcOverrides {
  id?: string;
  userId?: string;
  peso?: number;
  altura?: number;
  fecha?: Date;
}

export class ImcFactory {
  static createInstance(overrides: ImcOverrides = {}): Imc {
    const fecha = overrides.fecha ?? new Date();
    return new Imc({
      id: Id_IMC.create(overrides.id ?? faker.string.uuid()).getValue(),
      userId: UserId.create(overrides.userId ?? faker.string.uuid()).getValue(),
      peso: Peso.create(overrides.peso ?? 80).getValue(),
      altura: Altura.create(overrides.altura ?? 170).getValue(),
      fecha: Fecha.fromDate(fecha).getValue(),
    });
  }
}
