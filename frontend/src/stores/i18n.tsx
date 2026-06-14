// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones (agregar footer)
import enCommon from "../locales/en/common.json";
import enFooter from "../locales/en/footer.json";
import enNav from "../locales/en/nav.json";

import esCommon from "../locales/es/common.json";
import esFooter from "../locales/es/footer.json";
import esNav from "../locales/es/nav.json";

import ptCommon from "../locales/pt/common.json";
import ptFooter from "../locales/pt/footer.json";
import ptNav from "../locales/pt/nav.json";

import jaCommon from "../locales/ja/common.json";
import jaFooter from "../locales/ja/footer.json";
import jaNav from "../locales/ja/nav.json";


// Agrupa tus recursos por idioma para facilitar la lectura
const resources = {
  en: { common: enCommon, nav: enNav, footer: enFooter },
  es: { common: esCommon, nav: esNav, footer: esFooter },
  pt: { common: ptCommon, nav: ptNav, footer: ptFooter },
  ja: { common: jaCommon, nav: jaNav, footer: jaFooter },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    ns: ["common", "nav", "footer"],
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