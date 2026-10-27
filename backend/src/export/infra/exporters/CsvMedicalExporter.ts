import { Injectable } from '@nestjs/common';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';
import { MedicalExportData } from '../../core/MedicalExportData';

const CSV_SEPARATOR = ';';
const CSV_BOM = '\uFEFF';

@Injectable()
export class CsvMedicalExporter {
  public readonly contentType = 'text/csv; charset=utf-8';
  public readonly extension = 'csv';

  constructor(private readonly translationService: TranslationService) {}

  public export(data: MedicalExportData, lang: string): Buffer {
    const rows: string[][] = [
      [
        this.t('EXPORT_COL_SECTION', lang),
        this.t('EXPORT_COL_DATE', lang),
        this.t('EXPORT_COL_TIME', lang),
        this.t('EXPORT_COL_MEASUREMENT', lang),
        this.t('EXPORT_COL_VALUE', lang),
        this.t('EXPORT_COL_UNIT', lang),
        this.t('EXPORT_COL_DETAIL', lang),
      ],
    ];

    for (const record of data.glucose) {
      rows.push([
        this.t('EXPORT_SECTION_GLUCOSE', lang),
        this.formatDate(record.date),
        record.time,
        this.t('EXPORT_GLUCOSE_MEASUREMENT', lang),
        this.formatNumber(record.valueMgdl),
        'mg/dL',
        this.translateMealTag(record.mealTag, lang),
      ]);
    }

    for (const record of data.hba1c) {
      rows.push([
        this.t('EXPORT_SECTION_HBA1C', lang),
        this.formatDate(record.examDate),
        '',
        this.t('EXPORT_HBA1C_MEASUREMENT', lang),
        this.formatNumber(record.valuePercent),
        '%',
        '',
      ]);
    }

    for (const record of data.insulin) {
      rows.push([
        this.t('EXPORT_SECTION_INSULIN', lang),
        this.formatDate(record.fecha),
        record.hora,
        this.translateInsulinType(record.tipo, lang),
        this.formatNumber(record.dosis),
        'UI',
        this.formatInsulinDetail(record.zona, record.contexto, lang),
      ]);
    }

    for (const record of data.imc) {
      rows.push([
        this.t('EXPORT_SECTION_IMC', lang),
        this.formatDate(record.fecha),
        '',
        this.t('EXPORT_IMC_MEASUREMENT', lang),
        this.formatNumber(record.imcValue),
        'kg/m²',
        `${this.formatNumber(record.peso)} kg / ${this.formatNumber(record.altura)} m`,
      ]);
    }

    const csv = rows
      .map((row) => row.map((cell) => this.escape(cell)).join(CSV_SEPARATOR))
      .join('\r\n');

    return Buffer.from(`${CSV_BOM}${csv}\r\n`, 'utf8');
  }

  private t(key: string, lang: string): string {
    return this.translationService.translate(key, lang);
  }

  private escape(value: string | number | null | undefined): string {
    const text = value === null || value === undefined ? '' : String(value);
    if (/[";\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
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

  private formatInsulinDetail(
    zona: string,
    contexto: string | null,
    lang: string,
  ): string {
    const zoneLabel = this.translateInjectionSite(zona, lang);
    if (!contexto) return zoneLabel;
    return `${zoneLabel} / ${this.translateInsulinContext(contexto, lang)}`;
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
