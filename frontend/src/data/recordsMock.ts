export interface GlucosaRecord {
  id: string;
  fechaISO: string;
  hora: string;
  nivel: number;
  contexto: string;
  estado: 'Normal' | 'Alto' | 'Bajo';
}

export interface ImcRecord {
  id: number;
  fechaISO: string;
  peso: number;
  estatura: number;
  imc: number;
  estado: string;
}

export interface HbA1cRecord {
  id: string;
  fechaISO: string;
  fecha: string;
  resultado: number;
  estimado: string;
  estado: 'En Meta' | 'Elevado' | 'Alto';
}