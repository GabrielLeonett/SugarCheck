import { apiPrivate } from './axios';

export interface CaminoProgresoResponse {
  ultimoNivelCompletado: number;
  updatedAt: string;
}

export const getCaminoProgreso = async (): Promise<CaminoProgresoResponse> => {
  const response = await apiPrivate.get<CaminoProgresoResponse>('/camino/progreso');
  return response.data;
};

export const completarNivelCamino = async (nivel: number): Promise<{ success: boolean }> => {
  const response = await apiPrivate.post<{ success: boolean }>('/camino/completar', { nivel });
  return response.data;
};
