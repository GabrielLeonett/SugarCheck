export interface GlucoseReminderSettings {
  enabled: boolean;
  fasting: string;
  afterMeal: string;
  nocturnal: string;
}

export interface InsulinReminderSettings {
  enabled: boolean;
  times: string[];
}

export interface PhysicalReminderSettings {
  enabled: boolean;
  /** Día de la semana según la API de Expo: 1 = domingo, 7 = sábado. */
  weekday: number;
  time: string;
}

export interface Hba1cReminderSettings {
  enabled: boolean;
  /** Fecha ISO del último examen. La próxima notificación se calcula a los 90 días. */
  lastExamDate: string;
  time: string;
}

export interface ReminderSettings {
  enabled: boolean;
  glucose: GlucoseReminderSettings;
  insulin: InsulinReminderSettings;
  physical: PhysicalReminderSettings;
  hba1c: Hba1cReminderSettings;
}

export const HBA1C_INTERVAL_DAYS = 90;

export function createDefaultReminderSettings(): ReminderSettings {
  return {
    enabled: false,
    glucose: {
      enabled: true,
      fasting: '07:00',
      afterMeal: '14:00',
      nocturnal: '22:00',
    },
    insulin: {
      enabled: true,
      times: [],
    },
    physical: {
      enabled: false,
      weekday: 1,
      time: '08:00',
    },
    hba1c: {
      enabled: false,
      lastExamDate: new Date().toISOString(),
      time: '09:00',
    },
  };
}
