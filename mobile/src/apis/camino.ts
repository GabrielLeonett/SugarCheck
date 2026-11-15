import { apiPrivate } from './axios';
import { useGuestStore } from '@/src/stores/guestStore';

export interface CaminoProgresoResponse {
  ultimoNivelCompletado: number;
  updatedAt: string;
}

export async function getCaminoProgreso(): Promise<CaminoProgresoResponse> {
  if (useGuestStore.getState().isGuestMode) {
    return {
      ultimoNivelCompletado: useGuestStore.getState().caminoProgress,
      updatedAt: new Date().toISOString(),
    };
  }

  const { data } = await apiPrivate.get<CaminoProgresoResponse>('/camino/progreso');
  return data;
}

export async function completarNivelCamino(nivel: number): Promise<void> {
  if (useGuestStore.getState().isGuestMode) {
    const current = useGuestStore.getState().caminoProgress;
    if (nivel > current + 1) {
      throw new Error('Los niveles del Camino deben completarse en orden.');
    }
    if (nivel > current) {
      await useGuestStore.getState().setCaminoProgress(nivel);
    }
    return;
  }

  await apiPrivate.post<{ success: boolean }>('/camino/completar', { nivel });
}
