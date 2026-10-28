import { CaminoProgresoRepository } from '../core/CaminoProgresoRepository';
import { CaminoProgreso } from '../core/CaminoProgreso';

export class GetCaminoProgreso {
  constructor(private readonly repo: CaminoProgresoRepository) {}

  async execute(userId: string): Promise<CaminoProgreso> {
    const progreso = await this.repo.findByUserId(userId);
    if (!progreso) {
      const nuevo = CaminoProgreso.create(userId, 0);
      return this.repo.save(nuevo);
    }
    return progreso;
  }
}
