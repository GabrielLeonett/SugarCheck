import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enProfile from './locales/en/profile.json';
import enScreens from './locales/en/screens.json';
import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esProfile from './locales/es/profile.json';
import esScreens from './locales/es/screens.json';
import jaAuth from './locales/ja/auth.json';
import jaCommon from './locales/ja/common.json';
import jaProfile from './locales/ja/profile.json';
import jaScreens from './locales/ja/screens.json';
import ptAuth from './locales/pt/auth.json';
import ptCommon from './locales/pt/common.json';
import ptProfile from './locales/pt/profile.json';
import ptScreens from './locales/pt/screens.json';

export const LANGUAGE_STORAGE_KEY = 'app_language';
const i18n = createInstance();

export const APP_LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]['code'];

function isAppLanguage(language: string | null): language is AppLanguage {
  return APP_LANGUAGES.some(({ code }) => code === language);
}

const resources = {
  es: { common: esCommon, auth: esAuth, profile: esProfile, screens: esScreens },
  en: { common: enCommon, auth: enAuth, profile: enProfile, screens: enScreens },
  pt: { common: ptCommon, auth: ptAuth, profile: ptProfile, screens: ptScreens },
  ja: { common: jaCommon, auth: jaAuth, profile: jaProfile, screens: jaScreens },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  supportedLngs: APP_LANGUAGES.map(({ code }) => code),
  defaultNS: 'common',
  ns: ['common', 'auth', 'profile', 'screens'],
  interpolation: { escapeValue: false },
});

export async function initializeAppLanguage(): Promise<void> {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isAppLanguage(savedLanguage)) {
    await i18n.changeLanguage(savedLanguage);
  }
}

export async function changeAppLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export default i18n;
