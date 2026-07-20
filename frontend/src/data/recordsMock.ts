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

const formatHourLabel = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  const minute = minutes.toString().padStart(2, '0');
  return `${hour} : ${minute} ${period}`;
};

const buildRecentGlucosaMock = (): GlucosaRecord[] => {
  const baseDate = new Date();
  const samples = [
    { offsetDays: 0, hour: 7, minute: 15, nivel: 98, contexto: 'En ayunas', estado: 'Normal' as const },
    { offsetDays: 0, hour: 14, minute: 30, nivel: 178, contexto: 'Control general', estado: 'Alto' as const },
    { offsetDays: 1, hour: 8, minute: 45, nivel: 112, contexto: 'Después de comer', estado: 'Normal' as const },
    { offsetDays: 1, hour: 19, minute: 20, nivel: 67, contexto: 'Antes de comer', estado: 'Bajo' as const },
    { offsetDays: 2, hour: 9, minute: 10, nivel: 104, contexto: 'En ayunas', estado: 'Normal' as const },
    { offsetDays: 3, hour: 21, minute: 10, nivel: 145, contexto: 'Control general', estado: 'Alto' as const },
    { offsetDays: 5, hour: 10, minute: 5, nivel: 92, contexto: 'Después de comer', estado: 'Normal' as const },
    { offsetDays: 35, hour: 22, minute: 30, nivel: 118, contexto: 'Después de comer', estado: 'Normal' as const },
  ];

  return samples.map((sample, index) => {
    const fecha = new Date(baseDate);
    fecha.setDate(baseDate.getDate() - sample.offsetDays);
    fecha.setHours(sample.hour, sample.minute, 0, 0);

    return {
      id: index + 1,
      fechaISO: fecha.toISOString(),
      hora: formatHourLabel(fecha),
      nivel: sample.nivel,
      contexto: sample.contexto,
      estado: sample.estado,
    };
  }).sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());
};

const buildRecentHbA1cMock = (): HbA1cRecord[] => {
  const now = new Date();
  const dates = [
    { offsetMonths: 0, value: 6.2, estado: 'En Meta' as const },
    { offsetMonths: 2, value: 7.1, estado: 'Elevado' as const },
    { offsetMonths: 5, value: 8.3, estado: 'Alto' as const },
  ];

  return dates.map((item, index) => {
    const fecha = new Date(now);
    fecha.setMonth(now.getMonth() - item.offsetMonths);
    fecha.setDate(15);

    return {
      id: index + 1,
      fechaISO: fecha.toISOString(),
      fecha: `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`,
      resultado: item.value,
      estimado: `${Math.round(item.value * 28)} mg/dL`,
      estado: item.estado,
    };
  });
};

export const historialGlucosaMock: GlucosaRecord[] = buildRecentGlucosaMock();

export const historialHbA1cMock: HbA1cRecord[] = buildRecentHbA1cMock();