import {
  Controller,
  Get,
  Inject,
  Query,
  Request,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';
import { ExportMedicalData } from '../../app/ExportMedicalData';
import { MedicalExportData } from '../../core/MedicalExportData';
import { CsvMedicalExporter } from '../exporters/CsvMedicalExporter';
import { PdfMedicalExporter } from '../exporters/PdfMedicalExporter';
import { ExportMedicalDataDTO } from './DTOs/export-medical-data.dto';

@Controller('export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(
    @Inject('ExportMedicalData')
    private readonly exportMedicalData: ExportMedicalData,
    private readonly csvExporter: CsvMedicalExporter,
    private readonly pdfExporter: PdfMedicalExporter,
    private readonly translationService: TranslationService,
  ) {}

  @Get('medical-data')
  async exportMedical(
    @Request() req: any,
    @Query() query: ExportMedicalDataDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const lang = this.translationService.resolveLanguage(
      req.headers['accept-language'] as string,
    );

    const result = await this.exportMedicalData.run({
      userId: req.user.sub,
      from: query.from,
      to: query.to,
    });

    if (!result.isValid) {
      throw result.getError();
    }

    const data = result.getValue();
    const format = query.format ?? 'pdf';
    const exporter = format === 'csv' ? this.csvExporter : this.pdfExporter;
    const buffer = await exporter.export(data, lang);
    const filename = this.buildFilename(data, exporter.extension);

    res.set({
      'Content-Type': exporter.contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
    });

    return new StreamableFile(buffer);
  }

  private buildFilename(
    data: MedicalExportData,
    extension: string,
  ): string {
    const username = this.sanitize(data.patient.username);
    const from = data.period.from
      ? this.formatDateForFilename(data.period.from)
      : 'inicio';
    const to = data.period.to
      ? this.formatDateForFilename(data.period.to)
      : 'hoy';
    return `datos-medicos-${username}-${from}_${to}.${extension}`;
  }

  private sanitize(value: string): string {
    const sanitized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return sanitized || 'paciente';
  }

  private formatDateForFilename(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
