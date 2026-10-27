import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { CaminoProgresoRepository } from '../core/CaminoProgresoRepository';
import { CaminoProgreso } from '../core/CaminoProgreso';

@Injectable()
export class PrismaCaminoProgresoRepository implements CaminoProgresoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CaminoProgreso | null> {
    const row = await this.prisma.caminoProgreso.findUnique({
      where: { userId },
    });
    if (!row) return null;
    return new CaminoProgreso(row.userId, row.ultimoNivelCompletado, row.updatedAt);
  }

  async save(progreso: CaminoProgreso): Promise<CaminoProgreso> {
    const row = await this.prisma.caminoProgreso.upsert({
      where: { userId: progreso.userId },
      update: {
        ultimoNivelCompletado: progreso.ultimoNivelCompletado,
        updatedAt: progreso.updatedAt,
      },
      create: {
        userId: progreso.userId,
        ultimoNivelCompletado: progreso.ultimoNivelCompletado,
        updatedAt: progreso.updatedAt,
      },
    });
    return new CaminoProgreso(row.userId, row.ultimoNivelCompletado, row.updatedAt);
  }
}
