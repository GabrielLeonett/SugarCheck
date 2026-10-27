export interface GlucosaRecord {
  id: string;
  fechaISO: string;
  hora: string;
  time: string;
  nivel: number;
  contexto: string;
  estado: 'Normal' | 'Alto' | 'Bajo';
  createdAt: string;
}

export interface ImcRecord {
  id: string;
  fechaISO: string;
  peso: number;
  estatura: number;
  imc: number;
  estado: string;
  createdAt: string;
}

export interface HbA1cRecord {
  id: string;
  fechaISO: string;
  fecha: string;
  resultado: number;
  estimado: string;
  estado: 'En Meta' | 'Elevado' | 'Alto';
  createdAt: string;
}