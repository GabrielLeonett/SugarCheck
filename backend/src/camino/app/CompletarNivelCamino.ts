import { CaminoProgreso } from '../core/CaminoProgreso';
import { CaminoProgresoRepository } from '../core/CaminoProgresoRepository';

export class CompletarNivelCamino {
  constructor(private readonly repo: CaminoProgresoRepository) {}

  async execute(userId: string, nivel: number): Promise<void> {
    const progreso = await this.repo.findByUserId(userId);
    if (!progreso) {
      const nuevo = CaminoProgreso.create(userId, nivel);
      await this.repo.save(nuevo);
      return;
    }
    progreso.completarNivel(nivel);
    await this.repo.save(progreso);
  }
}
