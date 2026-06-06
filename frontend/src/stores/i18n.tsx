// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones (agregar footer)
import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";

import esNav from "../locales/es/nav.json";

import ptNav from "../locales/pt/nav.json";

import jaNav from "../locales/ja/nav.json";


// Agrupa tus recursos por idioma para facilitar la lectura
const resources = {
  en: { common: enCommon, nav: enNav },
  es: { nav: esNav },
  pt: { nav: ptNav },
  ja: { nav: jaNav },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    ns: ["common", "nav"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded",
      bindI18nStore: "added removed",
    },
  });

export default i18n;