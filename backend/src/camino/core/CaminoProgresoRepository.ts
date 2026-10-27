import { CaminoProgreso } from './CaminoProgreso';

export interface CaminoProgresoRepository {
  findByUserId(userId: string): Promise<CaminoProgreso | null>;
  save(progreso: CaminoProgreso): Promise<CaminoProgreso>;
}
