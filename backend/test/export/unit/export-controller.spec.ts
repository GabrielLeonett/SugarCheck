import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { ExportMedicalData } from '../../../src/export/app/ExportMedicalData';
import { MedicalExportData } from '../../../src/export/core/MedicalExportData';
import { CsvMedicalExporter } from '../../../src/export/infra/exporters/CsvMedicalExporter';
import { PdfMedicalExporter } from '../../../src/export/infra/exporters/PdfMedicalExporter';
import { ExportController } from '../../../src/export/infra/Nest/export.controller';
import { ExportMedicalDataDTO } from '../../../src/export/infra/Nest/DTOs/export-medical-data.dto';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';
import { Result } from '../../../src/shared/result';

function buildExportData(): MedicalExportData {
  return {
    patient: { name: 'Paciente Test', username: 'Paciente Ñandú' },
    period: { from: null, to: null },
    generatedAt: new Date(2026, 9, 27, 10, 30, 0),
    glucose: [],
    hba1c: [],
    insulin: [],
    imc: [],
  };
}

function buildResponse() {
  return { set: jest.fn() } as unknown as Response & {
    set: jest.Mock;
  };
}

describe('ExportController', () => {
  let useCase: { run: jest.Mock };
  let csvExporter: {
    export: jest.Mock;
    contentType: string;
    extension: string;
  };
  let pdfExporter: {
    export: jest.Mock;
    contentType: string;
    extension: string;
  };
  let controller: ExportController;

  const request = { user: { sub: 'user-1' }, headers: {} } as any;

  beforeEach(() => {
    useCase = {
      run: jest.fn().mockResolvedValue(
        Result.ok<MedicalExportData, ErrorAbstract>(buildExportData()),
      ),
    };
    csvExporter = {
      export: jest.fn().mockResolvedValue(Buffer.from('csv')),
      contentType: 'text/csv; charset=utf-8',
      extension: 'csv',
    };
    pdfExporter = {
      export: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4')),
      contentType: 'application/pdf',
      extension: 'pdf',
    };
    controller = new ExportController(
      useCase as unknown as ExportMedicalData,
      csvExporter as unknown as CsvMedicalExporter,
      pdfExporter as unknown as PdfMedicalExporter,
      new TranslationService('es'),
    );
  });

  test('genera un PDF por defecto y expone el nombre del archivo', async () => {
    const res = buildResponse();

    const file = await controller.exportMedical(
      request,
      {} as ExportMedicalDataDTO,
      res,
    );

    expect(file).toBeInstanceOf(StreamableFile);
    expect(useCase.run).toHaveBeenCalledWith({
      userId: 'user-1',
      from: undefined,
      to: undefined,
    });
    expect(pdfExporter.export).toHaveBeenCalledWith(
      expect.any(Object),
      'es',
    );
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="datos-medicos-paciente-nandu-inicio_hoy.pdf"',
      }),
    );
  });

  test('genera un CSV cuando se solicita el formato csv', async () => {
    const res = buildResponse();

    await controller.exportMedical(
      request,
      { format: 'csv' } as ExportMedicalDataDTO,
      res,
    );

    expect(csvExporter.export).toHaveBeenCalled();
    expect(pdfExporter.export).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="datos-medicos-paciente-nandu-inicio_hoy.csv"',
      }),
    );
  });

  test('propaga el rango de fechas al caso de uso', async () => {
    await controller.exportMedical(
      request,
      { format: 'pdf', from: '2026-10-01', to: '2026-10-27' },
      buildResponse(),
    );

    expect(useCase.run).toHaveBeenCalledWith({
      userId: 'user-1',
      from: '2026-10-01',
      to: '2026-10-27',
    });
  });

  test('usa el idioma de la cabecera Accept-Language', async () => {
    await controller.exportMedical(
      { ...request, headers: { 'accept-language': 'ja-JP' } },
      {} as ExportMedicalDataDTO,
      buildResponse(),
    );

    expect(pdfExporter.export).toHaveBeenCalledWith(
      expect.any(Object),
      'ja',
    );
  });

  test('lanza el error de dominio cuando el caso de uso falla', async () => {
    const error = new Error('rango inválido') as ErrorAbstract;
    useCase.run.mockResolvedValue(
      Result.fail<MedicalExportData, ErrorAbstract>(error),
    );

    await expect(
      controller.exportMedical(
        request,
        {} as ExportMedicalDataDTO,
        buildResponse(),
      ),
    ).rejects.toBe(error);
  });
});
