import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../../../auth/infra/auth.module';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ExportMedicalData } from '../../app/ExportMedicalData';
import { MedicalExportRepository } from '../../core/MedicalExportRepository';
import { PrismaMedicalExportRepository } from '../PrismaMedicalExportRepository';
import { CsvMedicalExporter } from '../exporters/CsvMedicalExporter';
import { PdfMedicalExporter } from '../exporters/PdfMedicalExporter';
import { ExportController } from './export.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    PrismaService,
    {
      provide: 'MedicalExportRepository',
      useClass: PrismaMedicalExportRepository,
    },
    {
      provide: 'ExportMedicalData',
      useFactory: (repository: MedicalExportRepository) =>
        new ExportMedicalData(repository),
      inject: ['MedicalExportRepository'],
    },
    CsvMedicalExporter,
    PdfMedicalExporter,
  ],
  controllers: [ExportController],
})
export class ExportModule {}
