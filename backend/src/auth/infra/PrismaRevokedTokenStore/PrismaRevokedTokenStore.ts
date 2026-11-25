import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import type { RevokedTokenStoreInterface } from '../../app/ports/RevokedTokenStoreInterface';

/**
 * Persistencia de los refresh tokens revocados (logout explícito).
 *
 * Se guarda el `jti` del refresh token hasta su fecha de expiración, de forma
 * que el endpoint `/auth/refresh` lo rechace aunque la cookie siga viva en el
 * navegador (`SameSite=None` cross-site, caché del navegador, otra pestaña…).
 *
 * Se limpian en cada escritura los registros ya expirados para que la tabla
 * no crezca indefinidamente.
 */
@Injectable()
export class PrismaRevokedTokenStore implements RevokedTokenStoreInterface {
  constructor(private readonly prisma: PrismaService) {}

  async revoke({ jti, expiresAt }: { jti: string; expiresAt: Date }): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.revokedToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      }),
      this.prisma.revokedToken.upsert({
        where: { jti },
        create: { jti, expiresAt },
        update: { expiresAt },
      }),
    ]);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const revoked = await this.prisma.revokedToken.findUnique({
      where: { jti },
      select: { jti: true },
    });

    return revoked !== null;
  }
}
