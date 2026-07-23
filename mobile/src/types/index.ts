export interface User {
  id: string;
  name: string;
  email: string;
  sexo: string;
  roles: string[];
  fechaNacimiento: string;
  createdAt: string;
}

export interface BackendErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface BackendErrorsApi extends Error {
  statusCode: number;
  message: string;
}

export interface Preference {
  userId: string;
  profileImg: string;
  unitMeasure: string;
  thresholds: {
    hypo: number;
    hiper: number;
  };
  insulinRatios: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  sensitivity: number;
  locale: string;
  theme: string;
}

export interface ContactEmergenceData {
  id: string;
  userId: string;
  name: string;
  parentesco: string;
  telefono?: string;
}

export interface PhysicalRecord {
  id: string;
  fecha: string;
  peso: number;
  estatura: number;
  imc: number;
  estado: string;
}

export interface GlucoseRecord {
  id: string;
  nivel: number;
  contexto: string;
  fecha: string;
  hora: string;
}

export interface HbA1cRecord {
  id: string;
  resultado: number;
  fecha: string;
}

export interface InsulinRecord {
  id: string;
  userId: string;
  tipo: string;
  dosis: number;
  unidades: number;
  fecha: string;
  hora: string;
  zona: string;
  zonaLabel: string;
  contexto: string | null;
  contextoLabel: string | null;
  createdAt: string;
}

export interface DailyInsulinTotals {
  totalRapida: number;
  totalLenta: number;
  totalGeneral: number;
}

export interface CreateInsulinDTO {
  tipo: 'RAPIDA' | 'LENTA';
  dosis: number;
  dia: number;
  mes: number;
  anio: number;
  hora: string;
  zona: string;
  contexto?: string;
}

export const ZONAS_INYECCION = {
  FRENTE: [
    { key: 'ABDOMEN_DERECHO', label: 'Abdomen Derecho', color: '#ef4444' },
    { key: 'ABDOMEN_IZQUIERDO', label: 'Abdomen Izquierdo', color: '#ef4444' },
    { key: 'MUSLO_DERECHO', label: 'Muslo Derecho', color: '#f59e0b' },
    { key: 'MUSLO_IZQUIERDO', label: 'Muslo Izquierdo', color: '#f59e0b' },
  ],
  ATRAS: [
    { key: 'BRAZO_DERECHO', label: 'Brazo Derecho', color: '#f97316' },
    { key: 'BRAZO_IZQUIERDO', label: 'Brazo Izquierdo', color: '#f97316' },
    { key: 'GLUTEO_DERECHO', label: 'Glúteo Derecho', color: '#22c55e' },
    { key: 'GLUTEO_IZQUIERDO', label: 'Glúteo Izquierdo', color: '#22c55e' },
  ],
} as const;

export const CONTEXTOS_INSULINA = [
  { key: 'DESAYUNO', label: 'Desayuno' },
  { key: 'ALMUERZO', label: 'Almuerzo' },
  { key: 'CENA', label: 'Cena' },
  { key: 'CORRECCION', label: 'Corrección' },
] as const;
