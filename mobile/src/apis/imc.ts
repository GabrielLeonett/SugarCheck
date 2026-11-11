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
}

function formatFecha(fecha: string): string {
  const date = new Date(fecha);
  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
}

function mapRecord(record: ImcBackendRecord): PhysicalRecord {
  return {
    id: record.id,
    fecha: formatFecha(record.fecha),
    peso: record.peso,
    estatura: record.altura,
    imc: record.imcValue,
    estado: record.categoria,
  };
}

export const imcApi = {
  async getAll(): Promise<PhysicalRecord[]> {
    if (useGuestStore.getState().isGuestMode) {
      return [...useGuestStore.getState().records.physical]
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
        .map((record) => ({
          id: record.id,
          fecha: formatFecha(String(record.fecha)),
          peso: Number(record.peso),
          estatura: Number(record.altura),
          imc: Number(record.imcValue),
          estado: String(record.categoria),
        }));
    }

    const res = await apiPrivate.get('/imc');
    return (res.data as ImcBackendRecord[]).map(mapRecord);
  },

  async create(dto: { peso: number; estatura: number; fecha: string }): Promise<PhysicalRecord> {
    if (useGuestStore.getState().isGuestMode) {
      const heightMeters = dto.estatura / 100;
      const imc = Number((dto.peso / (heightMeters * heightMeters)).toFixed(1));
      const record: PhysicalRecord = {
        id: createGuestId(),
        fecha: formatFecha(dto.fecha),
        peso: dto.peso,
        estatura: dto.estatura,
        imc,
        estado: imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad',
      };
      await useGuestStore.getState().saveRecord('physical', {
        id: record.id,
        peso: dto.peso,
        altura: dto.estatura,
        imcValue: imc,
        categoria: record.estado,
        fecha: dto.fecha,
        createdAt: new Date().toISOString(),
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
