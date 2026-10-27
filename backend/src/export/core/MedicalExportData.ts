export interface ExportGlucoseRecord {
  date: Date;
  time: string;
  valueMgdl: number;
  mealTag: string;
}

export interface ExportHbA1cRecord {
  examDate: Date;
  valuePercent: number;
}

export interface ExportInsulinRecord {
  fecha: Date;
  hora: string;
  tipo: string;
  dosis: number;
  zona: string;
  contexto: string | null;
}

export interface ExportImcRecord {
  fecha: Date;
  peso: number;
  altura: number;
  imcValue: number;
}

export interface MedicalExportPatient {
  name: string;
  username: string;
}

export interface MedicalExportPeriod {
  from: Date | null;
  to: Date | null;
}

export interface MedicalExportData {
  patient: MedicalExportPatient;
  period: MedicalExportPeriod;
  generatedAt: Date;
  glucose: ExportGlucoseRecord[];
  hba1c: ExportHbA1cRecord[];
  insulin: ExportInsulinRecord[];
  imc: ExportImcRecord[];
}
