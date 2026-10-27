import { MedicalExportData } from '../../../src/export/core/MedicalExportData';
import { CsvMedicalExporter } from '../../../src/export/infra/exporters/CsvMedicalExporter';
import { PdfMedicalExporter } from '../../../src/export/infra/exporters/PdfMedicalExporter';
import { TranslationService } from '../../../src/shared/infrastructure/i18n/translation.service';

function buildExportData(): MedicalExportData {
  return {
    patient: { name: 'Paciente Test', username: 'paciente' },
    period: {
      from: new Date(2026, 9, 1, 0, 0, 0, 0),
      to: new Date(2026, 9, 27, 23, 59, 59, 999),
    },
    generatedAt: new Date(2026, 9, 27, 10, 30, 0),
    glucose: [
      {
        date: new Date(2026, 9, 27),
        time: '08:30',
        valueMgdl: 120,
        mealTag: 'En Ayunas',
      },
    ],
    hba1c: [{ examDate: new Date(2026, 9, 20), valuePercent: 6.2 }],
    insulin: [
      {
        fecha: new Date(2026, 9, 27),
        hora: '08:35',
        tipo: 'RAPIDA',
        dosis: 6,
        zona: 'ABDOMEN_DERECHO',
        contexto: 'DESAYUNO',
      },
    ],
    imc: [
      {
        fecha: new Date(2026, 9, 27),
        peso: 70,
        altura: 1.73,
        imcValue: 23.4,
      },
    ],
  };
}

describe('CsvMedicalExporter', () => {
  const translationService = new TranslationService('es');
  const exporter = new CsvMedicalExporter(translationService);

  test('incluye BOM UTF-8 y una cabecera en español', () => {
    const buffer = exporter.export(buildExportData(), 'es');
    const text = buffer.toString('utf8');

    expect(buffer[0]).toBe(0xef);
    expect(buffer[1]).toBe(0xbb);
    expect(buffer[2]).toBe(0xbf);
    expect(text.startsWith('\uFEFF')).toBe(true);
    expect(text).toContain(
      'Sección;Fecha;Hora;Medición;Valor;Unidad;Detalle',
    );
  });

  test('genera una fila por registro con separador punto y coma', () => {
    const text = exporter.export(buildExportData(), 'es').toString('utf8');
    const rows = text.replace('\uFEFF', '').trimEnd().split('\r\n');

    expect(rows).toHaveLength(5);
    expect(rows[1]).toBe(
      'Glucosa;27/10/2026;08:30;Glucemia;120;mg/dL;En ayunas',
    );
    expect(rows[2]).toBe('HbA1c;20/10/2026;;HbA1c;6.2;%;');
    expect(rows[3]).toBe(
      'Insulina;27/10/2026;08:35;Insulina rápida;6;UI;Abdomen derecho / Desayuno',
    );
    expect(rows[4]).toBe('IMC;27/10/2026;;IMC;23.4;kg/m²;70 kg / 1.7 m');
  });

  test('traduce las etiquetas al japonés', () => {
    const text = exporter.export(buildExportData(), 'ja').toString('utf8');

    expect(text).toContain('セクション;日付;時刻;測定項目;値;単位;詳細');
    expect(text).toContain('血糖値;27/10/2026;08:30;血糖値;120;mg/dL;空腹時');
  });

  test('escapa celdas que contienen el separador o comillas', () => {
    const data = buildExportData();
    data.insulin[0].zona = 'ABDOMEN;"DERECHO"';

    const text = exporter.export(data, 'es').toString('utf8');

    expect(text).toContain('"ABDOMEN;""DERECHO"" / Desayuno"');
  });
});

describe('PdfMedicalExporter', () => {
  const translationService = new TranslationService('es');
  const exporter = new PdfMedicalExporter(translationService);

  test('genera un PDF válido en español', async () => {
    const buffer = await exporter.export(buildExportData(), 'es');

    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(buffer.subarray(-6).toString('latin1')).toContain('%%EOF');
  });

  test('genera un PDF válido con etiquetas en japonés', async () => {
    const buffer = await exporter.export(buildExportData(), 'ja');

    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
