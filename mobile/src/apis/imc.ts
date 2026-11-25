import { apiPrivate } from './axios';
import type { PhysicalRecord } from '../types';
import { createGuestId, useGuestStore } from '@/src/stores/guestStore';
import {
  pullChanges,
  pushChanges,
  addPendingChange,
  makeSyncRecord,
  FROM_SYNC_RECORD,
  type SyncTableName,
} from '@/src/sync';

const TABLE: SyncTableName = 'imc';

interface ImcBackendRecord {
  id: string;
  peso: number;
  altura: number;
  imcValue: number;
  categoria: string;
  fecha: string;
  createdAt: string;
}

/**
 * Convierte una fecha almacenada a `dd/mm/yyyy`.
 *
 * Acepta tres casos:
 * - `dd/mm/yyyy` ya formateado (registros antiguos de invitado).
 * - ISO (`2026-11-24T20:00:00.000Z` o `2026-11-24`): se toma la parte de fecha
 *   del string, sin reinterpretarla en otra zona horaria.
 * - Cualquier otro valor parseable por `Date` (respaldo).
 */
function formatFecha(fecha: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) return fecha;

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
}

/** `yyyy-mm-dd` con la fecha local del dispositivo, sin hora ni zona. */
function localDateKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fechaKey(fecha: string): number {
  const [day, month, year] = fecha.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

function createdAtKey(record: PhysicalRecord): number {
  if (!record.createdAt) return 0;
  const time = new Date(record.createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Ordena de más reciente a más antiguo.
 *
 * El formulario solo captura el día (sin hora), así que dos mediciones del
 * mismo día empatan en `fecha`; en ese caso gana la que se creó después.
 */
export function sortPhysicalRecords(records: PhysicalRecord[]): PhysicalRecord[] {
  return [...records].sort((a, b) => {
    const dateDiff = fechaKey(b.fecha) - fechaKey(a.fecha);
    if (dateDiff !== 0) return dateDiff;
    return createdAtKey(b) - createdAtKey(a);
  });
}

function mapRecord(record: ImcBackendRecord): PhysicalRecord {
  return {
    id: record.id,
    fecha: formatFecha(record.fecha),
    peso: record.peso,
    estatura: record.altura,
    imc: record.imcValue,
    estado: record.categoria,
    createdAt: record.createdAt,
  };
}

export const imcApi = {
  async getAll(): Promise<PhysicalRecord[]> {
    if (useGuestStore.getState().isGuestMode) {
      return sortPhysicalRecords(
        useGuestStore.getState().records.physical.map((record) => ({
          id: record.id,
          fecha: formatFecha(String(record.fecha)),
          peso: Number(record.peso),
          estatura: Number(record.altura),
          imc: Number(record.imcValue),
          estado: String(record.categoria),
          createdAt: record.createdAt == null ? undefined : String(record.createdAt),
        }))
      );
    }

    const res = await apiPrivate.get('/imc');
    return sortPhysicalRecords((res.data as ImcBackendRecord[]).map(mapRecord));
  },

  async create(dto: { peso: number; estatura: number; fecha: string }): Promise<PhysicalRecord> {
    if (useGuestStore.getState().isGuestMode) {
      const heightMeters = dto.estatura / 100;
      const imc = Number((dto.peso / (heightMeters * heightMeters)).toFixed(1));
      const fecha = localDateKey(dto.fecha);
      const createdAt = new Date().toISOString();
      const record: PhysicalRecord = {
        id: createGuestId(),
        fecha: formatFecha(fecha),
        peso: dto.peso,
        estatura: dto.estatura,
        imc,
        estado: imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad',
        createdAt,
      };
      await useGuestStore.getState().saveRecord('physical', {
        id: record.id,
        peso: dto.peso,
        altura: dto.estatura,
        imcValue: imc,
        categoria: record.estado,
        fecha,
        createdAt,
      });
      return record;
    }

    const date = new Date(dto.fecha);
    const res = await apiPrivate.post('/imc', {
      peso: dto.peso,
      altura: dto.estatura,
      dia: date.getDate(),
      mes: date.getMonth() + 1,
      anio: date.getFullYear(),
    });
    return mapRecord(res.data as ImcBackendRecord);
  },
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*  PROTOCOLO DE SINCRONIZACIÓN                                                */
/*─────────────────────────────────────────────────────────────────────────────*/

export async function syncPullImc(): Promise<PhysicalRecord[]> {
  const deltas = await pullChanges();
  const delta = deltas[TABLE];
  if (!delta) return [];

  return [
    ...(delta.created ?? []),
    ...(delta.updated ?? []),
  ].map((rec) => FROM_SYNC_RECORD[TABLE](rec) as PhysicalRecord);
}

export function syncSaveImc(rec: PhysicalRecord, op: 'created' | 'updated' = 'created'): void {
  const alturaM = rec.estatura / 100;
  const imcValue = rec.peso / (alturaM * alturaM);
  const syncRec = makeSyncRecord(
    rec.id,
    {
      peso: rec.peso,
      altura: rec.estatura,
      fecha: rec.fecha,
      imcValue: Number(imcValue.toFixed(1)),
    },
    Date.now(),
    Date.now(),
  );
  addPendingChange(TABLE, { [op]: [syncRec] });
}

export function syncDeleteImc(id: string): void {
  addPendingChange(TABLE, { deleted: [id] });
}

export async function syncPushImc() {
  return pushChanges();
}
