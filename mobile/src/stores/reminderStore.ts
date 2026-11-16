import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  ensureNotificationPermissions,
  syncReminderSchedules,
} from '@/src/notifications/reminders';
import { normalizeTime } from '@/src/notifications/time';
import {
  createDefaultReminderSettings,
  type ReminderSettings,
} from '@/src/notifications/types';

const REMINDERS_STORAGE_KEY = 'sugarcheck_reminders_v1';
const MAX_INSULIN_TIMES = 10;

export type SaveReminderResult = 'saved' | 'permission-denied' | 'error';

interface ReminderState {
  settings: ReminderSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (settings: ReminderSettings) => Promise<SaveReminderResult>;
  sync: () => Promise<void>;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeTimes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();
  value.forEach((entry) => {
    const normalized = normalizeTime(entry, '');
    if (normalized) {
      unique.add(normalized);
    }
  });

  return Array.from(unique)
    .sort()
    .slice(0, MAX_INSULIN_TIMES);
}

function normalizeSettings(raw: unknown): ReminderSettings {
  const defaults = createDefaultReminderSettings();

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const value = raw as Partial<ReminderSettings>;
  const glucose: Partial<ReminderSettings['glucose']> = value.glucose ?? {};
  const insulin: Partial<ReminderSettings['insulin']> = value.insulin ?? {};
  const physical: Partial<ReminderSettings['physical']> = value.physical ?? {};
  const hba1c: Partial<ReminderSettings['hba1c']> = value.hba1c ?? {};

  const lastExamDate = new Date(String(hba1c.lastExamDate));
  const weekday = Number(physical.weekday);

  return {
    enabled: normalizeBoolean(value.enabled),
    glucose: {
      enabled: normalizeBoolean(glucose.enabled),
      fasting: normalizeTime(glucose.fasting, defaults.glucose.fasting),
      afterMeal: normalizeTime(glucose.afterMeal, defaults.glucose.afterMeal),
      nocturnal: normalizeTime(glucose.nocturnal, defaults.glucose.nocturnal),
    },
    insulin: {
      enabled: normalizeBoolean(insulin.enabled),
      times: normalizeTimes(insulin.times),
    },
    physical: {
      enabled: normalizeBoolean(physical.enabled),
      weekday:
        Number.isInteger(weekday) && weekday >= 1 && weekday <= 7
          ? weekday
          : defaults.physical.weekday,
      time: normalizeTime(physical.time, defaults.physical.time),
    },
    hba1c: {
      enabled: normalizeBoolean(hba1c.enabled),
      lastExamDate: Number.isNaN(lastExamDate.getTime())
        ? defaults.hba1c.lastExamDate
        : lastExamDate.toISOString(),
      time: normalizeTime(hba1c.time, defaults.hba1c.time),
    },
  };
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  settings: createDefaultReminderSettings(),
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    let settings = createDefaultReminderSettings();

    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        settings = normalizeSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('No se pudieron leer los recordatorios guardados:', error);
    }

    set({ settings, hydrated: true });

    if (settings.enabled) {
      try {
        await syncReminderSchedules(settings);
      } catch (error) {
        console.error('No se pudieron reprogramar los recordatorios:', error);
      }
    }
  },

  save: async (settings) => {
    try {
      if (settings.enabled) {
        const allowed = await ensureNotificationPermissions();
        if (!allowed) {
          return 'permission-denied';
        }
      }

      const normalized = normalizeSettings(settings);

      await AsyncStorage.setItem(
        REMINDERS_STORAGE_KEY,
        JSON.stringify(normalized)
      );
      set({ settings: normalized });
      await syncReminderSchedules(normalized);
      return 'saved';
    } catch (error) {
      console.error('No se pudieron guardar los recordatorios:', error);
      return 'error';
    }
  },

  sync: async () => {
    try {
      await syncReminderSchedules(get().settings);
    } catch (error) {
      console.error('No se pudieron sincronizar los recordatorios:', error);
    }
  },
}));
