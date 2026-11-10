/**
 * Adaptadores entre los tipos del móvil y el formato de sincronización del backend.
 *
 * El backend espera en /sync/push:
 *   { id, data: { <campos de negocio> }, createdAt, updatedAt }
 * y devuelve en /sync/pull:
 *   { id, data: { <campos de negocio> }, createdAt (epoch ms), updatedAt (epoch ms), ...otros campos }
 */

import type {
  SyncTableName,
  SyncRecord,
  TableChanges,
  TableDelta,
} from './sync.types';
import type { GlucoseEntry } from '@/src/apis/glucose';
import type { InsulinRecord } from '@/src/types';
import type { PhysicalRecord } from '@/src/types';
import type { ContactEmergenceData } from '@/src/types';
import type { Preference } from '@/src/types';
import type { HbA1cRecord } from '@/src/types';

const now = () => Date.now();

/*─────────────────────────────────────────────────────────────────────────────*/
/*  GLUCOSE                                                                    */
/*─────────────────────────────────────────────────────────────────────────────*/

export function glucoseToSyncRecord(entry: GlucoseEntry): SyncRecord {
  return {
    id: entry.id,
    data: {
      valueMgdl: entry.nivel,
      mealTag: entry.contexto,
      date: entry.fecha,
      time: entry.hora,
    },
    createdAt: entry.timestamp.getTime(),
    updatedAt: entry.timestamp.getTime(),
  };
}

export function syncRecordToGlucose(rec: Record<string, unknown>): GlucoseEntry {
  const createdAtVal = rec.createdAt as string | number | Date | undefined;
  return {
    id: String(rec.id ?? ''),
    nivel: Number(rec.valueMgdl ?? 0),
    contexto: String(rec.mealTag ?? ''),
    fecha: String(rec.date ?? ''),
    hora: String(rec.time ?? ''),
    timestamp:
      createdAtVal instanceof Date
        ? createdAtVal
        : typeof createdAtVal === 'number'
          ? new Date(createdAtVal)
          : new Date(createdAtVal ?? now()),
  } as GlucoseEntry;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  INSULINA                                                                   */
/*─────────────────────────────────────────────────────────────────────────────*/

export function insulinaToSyncRecord(rec: InsulinRecord): SyncRecord {
  return {
    id: rec.id,
    data: {
      tipo: rec.tipo,
      dosis: rec.dosis,
      unidades: rec.unidades ?? rec.dosis,
      fecha: rec.fecha,
      hora: rec.hora,
      zona: rec.zona,
      contexto: rec.contexto ?? null,
    },
    createdAt: new Date(rec.createdAt).getTime(),
    updatedAt: new Date(rec.createdAt).getTime(),
  };
}

export function syncRecordToInsulina(rec: Record<string, unknown>): InsulinRecord {
  const createdAtVal = rec.createdAt as string | number | Date | undefined;
  const createdAt =
    createdAtVal instanceof Date
      ? createdAtVal
      : typeof createdAtVal === 'number'
        ? new Date(createdAtVal)
        : typeof createdAtVal === 'string'
          ? new Date(createdAtVal)
          : new Date(now());
  return {
    id: String(rec.id ?? ''),
    userId: String(rec.userId ?? ''),
    tipo: String(rec.tipo ?? ''),
    dosis: Number(rec.dosis ?? 0),
    unidades: Number(rec.unidades ?? rec.dosis ?? 0),
    fecha: String(rec.fecha ?? ''),
    hora: String(rec.hora ?? ''),
    zona: String(rec.zona ?? ''),
    zonaLabel: String(rec.zonaLabel ?? ''),
    contexto: (rec.contexto ?? null) as string | null,
    contextoLabel: (rec.contextoLabel ?? null) as string | null,
    createdAt: createdAt.toISOString(),
  } as InsulinRecord;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  IMC                                                                        */
/*─────────────────────────────────────────────────────────────────────────────*/

export function imcToSyncRecord(rec: PhysicalRecord): SyncRecord {
  const alturaM = rec.estatura / 100;
  const imcValue = rec.peso / (alturaM * alturaM);
  return {
    id: rec.id,
    data: {
      peso: rec.peso,
      altura: rec.estatura,
      fecha: rec.fecha,
      imcValue: Number(imcValue.toFixed(1)),
    },
    createdAt: now(),
    updatedAt: now(),
  };
}

export function syncRecordToImc(rec: Record<string, unknown>): PhysicalRecord {
  const peso = Number(rec.peso ?? 0);
  const estatura = Number(rec.estatura ?? 0);
  const alturaM = estatura / 100;
  const imc = peso / (alturaM * alturaM);
  const estado =
    imc < 18.5 ? 'Bajo peso' : imc >= 25 ? 'Sobrepeso' : 'Normal';
  return {
    id: String(rec.id ?? ''),
    fecha: String(rec.fecha ?? ''),
    peso,
    estatura,
    imc: Number(imc.toFixed(1)),
    estado,
  } as PhysicalRecord;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  CONTACT EMERGENCE                                                          */
/*─────────────────────────────────────────────────────────────────────────────*/

export function contactToSyncRecord(rec: ContactEmergenceData): SyncRecord {
  return {
    id: rec.id,
    data: {
      name: rec.name,
      parentesco: rec.parentesco,
      telefono: rec.telefono ?? null,
    },
    createdAt: now(),
    updatedAt: now(),
  };
}

export function syncRecordToContact(rec: Record<string, unknown>): ContactEmergenceData {
  return {
    id: String(rec.id ?? ''),
    userId: String(rec.userId ?? ''),
    name: String(rec.name ?? ''),
    parentesco: String(rec.parentesco ?? ''),
    telefono: (rec.telefono ?? undefined) as string | undefined,
  } as ContactEmergenceData;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  PREFERENCE                                                                 */
/*─────────────────────────────────────────────────────────────────────────────*/

export function preferenceToSyncRecord(pref: Preference): SyncRecord {
  return {
    id: pref.userId, // preference usa userId como clave
    data: {
      profileImg: pref.profileImg,
      unitMeasure: pref.unitMeasure,
      thresholds: pref.thresholds,
      insulinRatios: pref.insulinRatios,
      sensitivity: pref.sensitivity,
      correctionSchemas: pref.correctionSchemas ?? null,
      basalSchemas: pref.basalSchemas ?? null,
    },
    createdAt: now(),
    updatedAt: now(),
  };
}

export function syncRecordToPreference(rec: Record<string, unknown>): Preference {
  return {
    userId: String(rec.userId ?? ''),
    profileImg: String(rec.profileImg ?? 'default'),
    unitMeasure: String(rec.unitMeasure ?? 'mg/dL'),
    thresholds: (rec.thresholds ?? { hypo: 70, hiper: 180 }) as {
      hypo: number;
      hiper: number;
    },
    insulinRatios: (rec.insulinRatios ?? {
      breakfast: 100,
      lunch: 100,
      dinner: 100,
    }) as { breakfast: number; lunch: number; dinner: number },
    sensitivity: Number(rec.sensitivity ?? 1),
    locale: String(rec.locale ?? 'es'),
    theme: String(rec.theme ?? 'light'),
    correctionSchemas: (rec.correctionSchemas ?? null) as any,
    basalSchemas: (rec.basalSchemas ?? null) as any,
  } as Preference;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  HBA1C                                                                      */
/*─────────────────────────────────────────────────────────────────────────────*/

export function hba1cToSyncRecord(rec: HbA1cRecord): SyncRecord {
  return {
    id: rec.id,
    data: {
      valuePercent: rec.resultado,
      examDate: rec.fecha,
    },
    createdAt: now(),
    updatedAt: now(),
  };
}

export function syncRecordToHbA1c(rec: Record<string, unknown>): HbA1cRecord {
  return {
    id: String(rec.id ?? ''),
    resultado: Number(rec.valuePercent ?? 0),
    fecha: String(rec.examDate ?? ''),
  } as HbA1cRecord;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*  TABLA -> ADAPTADOR                                                         */
/*─────────────────────────────────────────────────────────────────────────────*/

export type ToSyncRecordFn = (rec: any) => SyncRecord;
export type FromSyncRecordFn = (rec: Record<string, unknown>) => any;

export const TO_SYNC_RECORD: Record<SyncTableName, ToSyncRecordFn> = {
  glucose: glucoseToSyncRecord,
  hba1c: hba1cToSyncRecord,
  insulina: insulinaToSyncRecord,
  imc: imcToSyncRecord,
  contactEmergence: contactToSyncRecord,
  preference: preferenceToSyncRecord,
};

export const FROM_SYNC_RECORD: Record<SyncTableName, FromSyncRecordFn> = {
  glucose: syncRecordToGlucose,
  hba1c: syncRecordToHbA1c,
  insulina: syncRecordToInsulina,
  imc: syncRecordToImc,
  contactEmergence: syncRecordToContact,
  preference: syncRecordToPreference,
};

/**
 * Obtiene el adaptador from-sync para una tabla dada.
 */
export function getFromSyncAdapter(table: SyncTableName): FromSyncRecordFn {
  return FROM_SYNC_RECORD[table];
}

/**
 * Agrupa cambios locales por tabla para enviarlos en un push.
 */
export function groupPendingChanges<
  T extends { table: SyncTableName; record: any; op: 'created' | 'updated' | 'deleted' },
>(items: T[]): Partial<Record<SyncTableName, TableChanges>> {
  const grouped: Partial<Record<SyncTableName, TableChanges>> = {};

  for (const item of items) {
    const table = item.table;
    if (!grouped[table]) {
      grouped[table] = {};
    }
    const tc = grouped[table]!;

    if (item.op === 'deleted') {
      tc.deleted = [...(tc.deleted ?? []), String(item.record.id)];
    } else {
      const syncRec = TO_SYNC_RECORD[table](item.record);
      if (item.op === 'created') {
        tc.created = [...(tc.created ?? []), syncRec];
      } else {
        tc.updated = [...(tc.updated ?? []), syncRec];
      }
    }
  }

  return grouped;
}
