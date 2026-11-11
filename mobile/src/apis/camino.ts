import { apiPrivate } from './axios';

export interface CaminoProgresoResponse {
  ultimoNivelCompletado: number;
  updatedAt: string;
}

export async function getCaminoProgreso(): Promise<CaminoProgresoResponse> {
  const { data } = await apiPrivate.get<CaminoProgresoResponse>('/camino/progreso');
  return data;
}

export async function completarNivelCamino(nivel: number): Promise<void> {
  await apiPrivate.post<{ success: boolean }>('/camino/completar', { nivel });
}
