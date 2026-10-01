import { faker } from '@faker-js/faker';
import { Insulina } from '../../../src/insulina/core/Insulina';
import { IdInsulina } from '../../../src/insulina/core/value-objects/IdInsulina';
import { TipoInsulina } from '../../../src/insulina/core/value-objects/TipoInsulina';
import { Dosis } from '../../../src/insulina/core/value-objects/Dosis';
import { FechaInsulina } from '../../../src/insulina/core/value-objects/FechaInsulina';
import { HoraInsulina } from '../../../src/insulina/core/value-objects/HoraInsulina';
import { ZonaInyeccion } from '../../../src/insulina/core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../../../src/insulina/core/value-objects/ContextoAplicacion';

export const VALID_ZONAS = [
  'ABDOMEN_DERECHO',
  'ABDOMEN_IZQUIERDO',
  'BRAZO_DERECHO',
  'BRAZO_IZQUIERDO',
  'MUSLO_DERECHO',
  'MUSLO_IZQUIERDO',
  'GLUTEO_DERECHO',
  'GLUTEO_IZQUIERDO',
] as const;

export const VALID_CONTEXTOS = [
  'DESAYUNO',
  'ALMUERZO',
  'CENA',
  'CORRECCION',
] as const;

interface InsulinaOverrides {
  id?: string;
  userId?: string;
  tipo?: 'RAPIDA' | 'LENTA';
  dosis?: number;
  fecha?: Date;
  hora?: string;
  zona?: string;
  contexto?: string | null;
  createdAt?: Date;
}

export class InsulinaFactory {
  static createInstance(overrides: InsulinaOverrides = {}): Insulina {
    const tipo = overrides.tipo ?? 'RAPIDA';
    const fecha = overrides.fecha ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isRapida = TipoInsulina.create(tipo).getValue().isRapida();
    const contexto = isRapida
      ? ContextoAplicacion.create(
          overrides.contexto ?? VALID_CONTEXTOS[0],
        ).getValue()
      : null;

    return new Insulina({
      id: IdInsulina.create(overrides.id ?? faker.string.uuid()).getValue(),
      userId: overrides.userId ?? faker.string.uuid(),
      tipo: TipoInsulina.create(tipo).getValue(),
      dosis: Dosis.create(overrides.dosis ?? 5).getValue(),
      fecha: FechaInsulina.create(
        fecha.getDate(),
        fecha.getMonth() + 1,
        fecha.getFullYear(),
      ).getValue(),
      hora: HoraInsulina.create(overrides.hora ?? '08:30').getValue(),
      zona: ZonaInyeccion.create(overrides.zona ?? VALID_ZONAS[0]).getValue(),
      contexto,
      createdAt: overrides.createdAt ?? new Date(),
    });
  }
}
