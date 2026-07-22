import { apiPrivate } from './axios';

export interface InsulinRecord {
  id: string;
  userId: string;
  tipo: string;
  unidades: number;
  dosis: number;
  fecha: string;
  hora: string;
  zona: string;
  zonaLabel: string;
  contexto: string | null;
  contextoLabel: string | null;
  createdAt: string;
}

export interface DailyTotals {
  totalRapida: number;
  totalLenta: number;
  totalGeneral: number;
}

export interface CreateInsulinDTO {
  tipo: 'RAPIDA' | 'LENTA';
  dosis: number;
  dia: number;
  mes: number;
  anio: number;
  hora: string;
  zona: string;
  contexto?: string;
}

export interface UpdateInsulinDTO {
  dosis?: number;
  dia?: number;
  mes?: number;
  anio?: number;
  hora?: string;
  zona?: string;
  contexto?: string;
}

export interface InsulinQueryParams {
  tipo?: 'RAPIDA' | 'LENTA';
  startDate?: string;
  endDate?: string;
}

function mapInsulinResponse(record: InsulinRecord): InsulinRecord {
  const date = new Date(record.fecha);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const aaaa = date.getFullYear();

  return {
    ...record,
    unidades: record.dosis,
  };
}

export const insulinaApi = {
  async getAll(params?: InsulinQueryParams): Promise<InsulinRecord[]> {
    const queryParams = new URLSearchParams();
    if (params?.tipo) queryParams.set('tipo', params.tipo);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const query = queryParams.toString();
    const url = query ? `/insulina?${query}` : '/insulina';

    const res = await apiPrivate.get(url);
    return (res.data as InsulinRecord[]).map(mapInsulinResponse);
  },

  async getById(id: string): Promise<InsulinRecord> {
    const res = await apiPrivate.get(`/insulina/${id}`);
    return mapInsulinResponse(res.data as InsulinRecord);
  },

  async create(dto: CreateInsulinDTO): Promise<InsulinRecord> {
    const res = await apiPrivate.post('/insulina', dto);
    return mapInsulinResponse(res.data as InsulinRecord);
  },

  async update(id: string, dto: UpdateInsulinDTO): Promise<InsulinRecord> {
    const res = await apiPrivate.patch(`/insulina/${id}`, dto);
    return mapInsulinResponse(res.data as InsulinRecord);
  },

  async delete(id: string): Promise<void> {
    await apiPrivate.delete(`/insulina/${id}`);
  },

  async getTotals(): Promise<DailyTotals> {
    const res = await apiPrivate.get('/insulina/totals');
    return res.data as DailyTotals;
  },
};
