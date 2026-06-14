import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const databaseUrl = config.get('DATABASE_URL');

    // Validación crítica de la variable de entorno
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL no está definida en las variables de entorno. El servicio de base de datos no puede iniciar.',
      );
    }

    // LÓGICA DE SSL DINÁMICA
    const isLocal =
      databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

    const pool = new Pool({
      connectionString: databaseUrl,
      // Si es local, ssl es false. Si es nube, se activa.
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool as any);

    super({
      adapter,
      // En desarrollo es útil ver las queries, en producción podrías querer solo 'error'
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Opcional: Escuchar eventos de query para logging avanzado
    (this as any).$on('query', (e: any) => {
      this.logger.debug(`Query: ${e.query} - Params: ${e.params}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(
        '✅ Conexión a la base de datos establecida correctamente.',
      );
    } catch (error) {
      this.logger.error('❌ Error al conectar con la base de datos:', error);
      process.exit(1); // Detener la app si no hay DB (opcional, según tu flujo)
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Conexión a la base de datos cerrada.');
    } catch (error) {
      this.logger.error(
        'Error al cerrar la conexión a la base de datos:',
        error,
      );
    }
  }
}
