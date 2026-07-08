export interface GlucosaRecord {
  id: number;
  fechaISO: string;
  hora: string;
  nivel: number;
  contexto: string;
  estado: 'Normal' | 'Alto' | 'Bajo';
}

export interface HbA1cRecord {
  id: number;
  fechaISO: string;
  fecha: string;
  resultado: number;
  estimado: string;
  estado: 'En Meta' | 'Elevado' | 'Alto';
}

export const historialGlucosaMock: GlucosaRecord[] = [
  { id: 1, fechaISO: "2026-06-11T07:15:00", hora: "07 : 15 AM", nivel: 98, contexto: "En ayunas", estado: "Normal" },
  { id: 2, fechaISO: "2026-06-11T14:30:00", hora: "02 : 30 PM", nivel: 215, contexto: "Control general", estado: "Alto" },
  { id: 3, fechaISO: "2026-06-10T18:45:00", hora: "06 : 45 PM", nivel: 62, contexto: "Antes de comer", estado: "Bajo" },
  { id: 4, fechaISO: "2026-06-08T22:00:00", hora: "10 : 00 PM", nivel: 110, contexto: "Después de comer", estado: "Normal" },
  { id: 5, fechaISO: "2025-05-25T23:00:00", hora: "11 : 00 PM", nivel: 100, contexto: "Después de comer", estado: "Normal" },
];

export const historialHbA1cMock: HbA1cRecord[] = [
  { id: 1, fechaISO: "2026-05-15T00:00:00", fecha: "15/05/2026", resultado: 6.8, estimado: "148 mg/dL", estado: "En Meta" },
  { id: 2, fechaISO: "2026-01-20T00:00:00", fecha: "20/01/2026", resultado: 7.6, estimado: "172 mg/dL", estado: "Elevado" },
  { id: 3, fechaISO: "2025-09-10T00:00:00", fecha: "10/09/2025", resultado: 8.4, estimado: "195 mg/dL", estado: "Alto" },
];