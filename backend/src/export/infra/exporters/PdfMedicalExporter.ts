import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';
import { MedicalExportData } from '../../core/MedicalExportData';

interface PdfColumn {
  label: string;
  width: number;
  align?: 'left' | 'right' | 'center';
}

const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const ROW_HEIGHT = 20;
const BOTTOM_MARGIN = 60;

@Injectable()
export class PdfMedicalExporter {
  public readonly contentType = 'application/pdf';
  public readonly extension = 'pdf';

  private readonly logger = new Logger(PdfMedicalExporter.name);
  private readonly japaneseFontPath = path.join(
    __dirname,
    'fonts',
    'NotoSansJP-Regular.ttf',
  );

  constructor(private readonly translationService: TranslationService) {}

  public async export(
    data: MedicalExportData,
    lang: string,
  ): Promise<Buffer> {
    const canUseJapaneseFont =
      lang === 'ja' && fs.existsSync(this.japaneseFontPath);
    const labelLang = lang === 'ja' && !canUseJapaneseFont ? 'en' : lang;
    const regularFont = canUseJapaneseFont ? 'NotoSansJP' : 'Helvetica';
    const boldFont = canUseJapaneseFont ? 'NotoSansJP' : 'Helvetica-Bold';

    if (lang === 'ja' && !canUseJapaneseFont) {
      this.logger.warn(
        `No se encontró la fuente japonesa en ${this.japaneseFontPath}. Se usarán etiquetas en inglés.`,
      );
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: this.t('EXPORT_TITLE', labelLang),
        Author: 'SugarCheck',
      },
    });

    if (canUseJapaneseFont) {
      doc.registerFont('NotoSansJP', this.japaneseFontPath);
    }

    const chunks: Buffer[] = [];
    const finished = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    this.renderHeader(doc, data, labelLang, regularFont, boldFont);
    this.renderGlucose(doc, data, labelLang, regularFont, boldFont);
    this.renderHbA1c(doc, data, labelLang, regularFont, boldFont);
    this.renderInsulin(doc, data, labelLang, regularFont, boldFont);
    this.renderImc(doc, data, labelLang, regularFont, boldFont);
    this.renderFooters(doc, labelLang, regularFont);

    doc.end();
    return finished;
  }

  private renderHeader(
    doc: PDFKit.PDFDocument,
    data: MedicalExportData,
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    doc
      .font(boldFont)
      .fontSize(20)
      .fillColor('#1A365D')
      .text(this.t('EXPORT_TITLE', lang));

    doc.moveDown(0.6);
    doc.font(regularFont).fontSize(10).fillColor('#2D3748');
    doc.text(
      `${this.t('EXPORT_PATIENT', lang)}: ${data.patient.name}`,
    );
    doc.text(
      `${this.t('EXPORT_USERNAME', lang)}: ${data.patient.username}`,
    );
    doc.text(
      `${this.t('EXPORT_PERIOD', lang)}: ${this.formatPeriod(data, lang)}`,
    );
    doc.text(
      `${this.t('EXPORT_GENERATED_AT', lang)}: ${this.formatDate(
        data.generatedAt,
      )} ${this.formatTime(data.generatedAt)}`,
    );

    doc.moveDown(0.8);
    doc
      .moveTo(PAGE_MARGIN, doc.y)
      .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y)
      .strokeColor('#CBD5E0')
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);
  }

  private renderGlucose(
    doc: PDFKit.PDFDocument,
    data: MedicalExportData,
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    const columns: PdfColumn[] = [
      { label: this.t('EXPORT_COL_DATE', lang), width: 100 },
      { label: this.t('EXPORT_COL_TIME', lang), width: 70 },
      { label: this.t('EXPORT_COL_VALUE', lang), width: 100 },
      { label: this.t('EXPORT_COL_DETAIL', lang), width: 245 },
    ];

    const rows = data.glucose.map((record) => [
      this.formatDate(record.date),
      record.time,
      `${this.formatNumber(record.valueMgdl)} mg/dL`,
      this.translateMealTag(record.mealTag, lang),
    ]);

    this.renderSection(
      doc,
      this.t('EXPORT_SECTION_GLUCOSE', lang),
      columns,
      rows,
      lang,
      regularFont,
      boldFont,
    );
  }

  private renderHbA1c(
    doc: PDFKit.PDFDocument,
    data: MedicalExportData,
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    const columns: PdfColumn[] = [
      { label: this.t('EXPORT_COL_DATE', lang), width: 180 },
      { label: this.t('EXPORT_COL_VALUE', lang), width: 150 },
      { label: this.t('EXPORT_COL_UNIT', lang), width: 185 },
    ];

    const rows = data.hba1c.map((record) => [
      this.formatDate(record.examDate),
      this.formatNumber(record.valuePercent),
      '%',
    ]);

    this.renderSection(
      doc,
      this.t('EXPORT_SECTION_HBA1C', lang),
      columns,
      rows,
      lang,
      regularFont,
      boldFont,
    );
  }

  private renderInsulin(
    doc: PDFKit.PDFDocument,
    data: MedicalExportData,
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    const columns: PdfColumn[] = [
      { label: this.t('EXPORT_COL_DATE', lang), width: 75 },
      { label: this.t('EXPORT_COL_TIME', lang), width: 55 },
      { label: this.t('EXPORT_COL_TYPE', lang), width: 110 },
      { label: this.t('EXPORT_COL_DOSE', lang), width: 65 },
      { label: this.t('EXPORT_COL_SITE', lang), width: 115 },
      { label: this.t('EXPORT_COL_CONTEXT', lang), width: 95 },
    ];

    const rows = data.insulin.map((record) => [
      this.formatDate(record.fecha),
      record.hora,
      this.translateInsulinType(record.tipo, lang),
      `${this.formatNumber(record.dosis)} UI`,
      this.translateInjectionSite(record.zona, lang),
      record.contexto
        ? this.translateInsulinContext(record.contexto, lang)
        : '-',
    ]);

    this.renderSection(
      doc,
      this.t('EXPORT_SECTION_INSULIN', lang),
      columns,
      rows,
      lang,
      regularFont,
      boldFont,
    );
  }

  private renderImc(
    doc: PDFKit.PDFDocument,
    data: MedicalExportData,
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    const columns: PdfColumn[] = [
      { label: this.t('EXPORT_COL_DATE', lang), width: 120 },
      { label: this.t('EXPORT_COL_WEIGHT', lang), width: 120 },
      { label: this.t('EXPORT_COL_HEIGHT', lang), width: 120 },
      { label: this.t('EXPORT_COL_IMC', lang), width: 155 },
    ];

    const rows = data.imc.map((record) => [
      this.formatDate(record.fecha),
      `${this.formatNumber(record.peso)} kg`,
      `${this.formatNumber(record.altura)} m`,
      this.formatNumber(record.imcValue),
    ]);

    this.renderSection(
      doc,
      this.t('EXPORT_SECTION_IMC', lang),
      columns,
      rows,
      lang,
      regularFont,
      boldFont,
    );
  }

  private renderSection(
    doc: PDFKit.PDFDocument,
    title: string,
    columns: PdfColumn[],
    rows: string[][],
    lang: string,
    regularFont: string,
    boldFont: string,
  ): void {
    doc.x = PAGE_MARGIN;
    doc.font(boldFont).fontSize(13).fillColor('#1A365D').text(title);
    doc.moveDown(0.4);

    if (rows.length === 0) {
      doc
        .font(regularFont)
        .fontSize(10)
        .fillColor('#4A5568')
        .text(this.t('EXPORT_NO_RECORDS', lang));
      doc.moveDown(1.2);
      return;
    }

    this.drawTable(doc, columns, rows, regularFont, boldFont);
  }

  private drawTable(
    doc: PDFKit.PDFDocument,
    columns: PdfColumn[],
    rows: string[][],
    regularFont: string,
    boldFont: string,
  ): void {
    const drawHeader = (): void => {
      const y = doc.y;
      doc
        .rect(PAGE_MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT)
        .fill('#EDF2F7');

      doc.fillColor('#1A365D').font(boldFont).fontSize(9);
      let x = PAGE_MARGIN;
      for (const column of columns) {
        doc.text(column.label, x + 4, y + 6, {
          width: column.width - 8,
          align: column.align ?? 'left',
          lineBreak: false,
          ellipsis: true,
        });
        x += column.width;
      }
      doc.y = y + ROW_HEIGHT;
    };

    drawHeader();

    for (const row of rows) {
      if (doc.y + ROW_HEIGHT > doc.page.height - BOTTOM_MARGIN) {
        doc.addPage();
        drawHeader();
      }

      const y = doc.y;
      doc.fillColor('#2D3748').font(regularFont).fontSize(9);

      let x = PAGE_MARGIN;
      row.forEach((cell, index) => {
        const column = columns[index];
        doc.text(cell, x + 4, y + 6, {
          width: column.width - 8,
          align: column.align ?? 'left',
          lineBreak: false,
          ellipsis: true,
        });
        x += column.width;
      });

      doc
        .moveTo(PAGE_MARGIN, y + ROW_HEIGHT)
        .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E2E8F0')
        .lineWidth(0.5)
        .stroke();

      doc.y = y + ROW_HEIGHT;
    }

    doc.moveDown(1.2);
  }

  private renderFooters(
    doc: PDFKit.PDFDocument,
    lang: string,
    regularFont: string,
  ): void {
    const range = doc.bufferedPageRange();
    const total = range.count;

    for (let index = range.start; index < range.start + total; index += 1) {
      doc.switchToPage(index);

      const bottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .font(regularFont)
        .fontSize(8)
        .fillColor('#718096')
        .text(
          `${this.t('EXPORT_PAGE', lang)} ${index + 1} / ${total}`,
          PAGE_MARGIN,
          doc.page.height - 35,
          {
            width: CONTENT_WIDTH,
            align: 'center',
            lineBreak: false,
          },
        );

      doc.page.margins.bottom = bottomMargin;
    }
  }

  private formatPeriod(data: MedicalExportData, lang: string): string {
    const from = data.period.from ? this.formatDate(data.period.from) : null;
    const to = data.period.to ? this.formatDate(data.period.to) : null;

    if (from && to) return `${from} - ${to}`;
    if (from) return `${this.t('EXPORT_FROM', lang)} ${from}`;
    if (to) return `${this.t('EXPORT_TO', lang)} ${to}`;
    return this.t('EXPORT_ALL_HISTORY', lang);
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  private t(key: string, lang: string): string {
    return this.translationService.translate(key, lang);
  }

  private translateMealTag(mealTag: string, lang: string): string {
    switch (mealTag) {
      case 'En Ayunas':
        return this.t('EXPORT_MEAL_FASTING', lang);
      case 'Despues de comer':
        return this.t('EXPORT_MEAL_AFTER', lang);
      case 'Control general':
        return this.t('EXPORT_MEAL_GENERAL', lang);
      default:
        return mealTag;
    }
  }

  private translateInsulinType(tipo: string, lang: string): string {
    const normalized = tipo.toUpperCase();
    if (normalized === 'RAPIDA' || normalized === 'RÁPIDA') {
      return this.t('EXPORT_INSULIN_RAPID', lang);
    }
    if (normalized === 'LENTA') {
      return this.t('EXPORT_INSULIN_SLOW', lang);
    }
    return tipo;
  }

  private translateInsulinContext(contexto: string, lang: string): string {
    switch (contexto.toUpperCase()) {
      case 'DESAYUNO':
        return this.t('EXPORT_CONTEXT_BREAKFAST', lang);
      case 'ALMUERZO':
        return this.t('EXPORT_CONTEXT_LUNCH', lang);
      case 'CENA':
        return this.t('EXPORT_CONTEXT_DINNER', lang);
      case 'CORRECCION':
      case 'CORRECCIÓN':
        return this.t('EXPORT_CONTEXT_CORRECTION', lang);
      case 'OTRO':
        return this.t('EXPORT_CONTEXT_OTHER', lang);
      default:
        return contexto;
    }
  }

  private translateInjectionSite(zona: string, lang: string): string {
    const normalized = zona
      .toUpperCase()
      .replace(/_/g, ' ')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U');

    switch (normalized) {
      case 'ABDOMEN DERECHO':
        return this.t('EXPORT_ZONE_ABDOMEN_RIGHT', lang);
      case 'ABDOMEN IZQUIERDO':
        return this.t('EXPORT_ZONE_ABDOMEN_LEFT', lang);
      case 'BRAZO DERECHO':
        return this.t('EXPORT_ZONE_ARM_RIGHT', lang);
      case 'BRAZO IZQUIERDO':
        return this.t('EXPORT_ZONE_ARM_LEFT', lang);
      case 'MUSLO DERECHO':
        return this.t('EXPORT_ZONE_THIGH_RIGHT', lang);
      case 'MUSLO IZQUIERDO':
        return this.t('EXPORT_ZONE_THIGH_LEFT', lang);
      case 'GLUTEO DERECHO':
        return this.t('EXPORT_ZONE_GLUTE_RIGHT', lang);
      case 'GLUTEO IZQUIERDO':
        return this.t('EXPORT_ZONE_GLUTE_LEFT', lang);
      default:
        return zona;
    }
  }
}
