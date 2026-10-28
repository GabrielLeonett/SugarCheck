export class CaminoProgreso {
  constructor(
    public readonly userId: string,
    public ultimoNivelCompletado: number,
    public updatedAt: Date = new Date(),
  ) {}

  static create(userId: string, ultimoNivelCompletado: number = 0): CaminoProgreso {
    return new CaminoProgreso(userId, ultimoNivelCompletado, new Date());
  }

  completarNivel(nivel: number): void {
    if (nivel > this.ultimoNivelCompletado) {
      this.ultimoNivelCompletado = nivel;
      this.updatedAt = new Date();
    }
  }
}
