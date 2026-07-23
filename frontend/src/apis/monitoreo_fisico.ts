import type { PhysicalRecord, MeasurementState } from '../types/types';
import { apiPrivate } from './axios';

interface ImcBackendResponse {
  id: string;
  userId: string;
  peso: number;
  altura: number;
  imcValue: number;
  categoria: string;
  fecha: string;
}

function mapImcResponse(record: ImcBackendResponse): PhysicalRecord {
  const date = new Date(record.fecha);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const aaaa = date.getFullYear();

  const estadoMap: Record<string, MeasurementState> = {
    'Bajo peso': 'Bajo peso',
    'Normal': 'Normal',
    'Sobrepeso': 'Sobrepeso',
  };

  return {
    id: record.id,
    fecha: `${dd}/${mm}/${aaaa}`,
    peso: record.peso,
    estatura: record.altura,
    imc: record.imcValue,
    estado: estadoMap[record.categoria] || 'Normal',
  };
}

export const imcApi = {
  async getAll(): Promise<PhysicalRecord[]> {
    const res = await apiPrivate.get('/imc');
    const data = res.data as ImcBackendResponse[];
    return data.map(mapImcResponse);
  },

  async create(dto: { peso: number; altura: number; dia: number; mes: number; anio: number }): Promise<PhysicalRecord> {
    const res = await apiPrivate.post('/imc', dto);
    return mapImcResponse(res.data as ImcBackendResponse);
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/imc/${id}`);
  },
};
