import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/**
 * Consentimiento de almacenamiento local en la app móvil.
 *
 * - `necessary`: sesión, registro de consentimiento y datos imprescindibles.
 * - `preferences`: idioma y tema visual guardados en AsyncStorage.
 */

export const COOKIE_CONSENT_STORAGE_KEY = 'sugarcheck_cookie_consent_v1';
export const THEME_STORAGE_KEY = 'theme';
export const LANGUAGE_STORAGE_KEY = 'app_language';

export interface CookieConsentRecord {
  necessary: true;
  preferences: boolean;
  updatedAt: string;
}

interface CookieConsentState {
  consent: CookieConsentRecord | null;
  hydrated: boolean;
  preferencesOpen: boolean;
  hydrate: () => Promise<void>;
  save: (preferences: boolean) => Promise<void>;
  openPreferences: () => void;
  closePreferences: () => void;
}

export const useCookieConsentStore = create<CookieConsentState>((set) => ({
  consent: null,
  hydrated: false,
  preferencesOpen: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!raw) {
        set({ consent: null, hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<CookieConsentRecord>;
      const consent: CookieConsentRecord | null = parsed?.necessary === true
        ? {
            necessary: true,
            preferences: Boolean(parsed.preferences),
            updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
          }
        : null;

      set({ consent, hydrated: true });
    } catch {
      set({ consent: null, hydrated: true });
    }
  },

  save: async (preferences) => {
    const record: CookieConsentRecord = {
      necessary: true,
      preferences,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));

    if (!preferences) {
      await AsyncStorage.multiRemove([THEME_STORAGE_KEY, LANGUAGE_STORAGE_KEY]);
    }

    set({ consent: record, hydrated: true, preferencesOpen: false });
  },

  openPreferences: () => set({ preferencesOpen: true }),
  closePreferences: () => set({ preferencesOpen: false }),
}));

/** Versión síncrona basada en el estado ya hidratado del store. */
export function arePreferenceStorageAllowed(): boolean {
  return useCookieConsentStore.getState().consent?.preferences === true;
}
