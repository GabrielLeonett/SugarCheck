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
  tipo: 'rapida' | 'lenta';
  dosis: number;
  fecha: string;
  hora: string;
}
