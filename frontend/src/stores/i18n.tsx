// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones (agregar footer)
import enCommon from "../locales/en/common.json";
import enFooter from "../locales/en/footer.json";
import enNav from "../locales/en/nav.json";
import enLogin from "../locales/en/login.json";
import enHome from "../locales/en/home.json";
import enGlicosilada from "../locales/en/glicosilada.json";
import enGlucemia from "../locales/en/glucemia.json";

import esCommon from "../locales/es/common.json";
import esFooter from "../locales/es/footer.json";
import esNav from "../locales/es/nav.json";
import esLogin from "../locales/es/login.json";
import esHome from "../locales/es/home.json";
import esGlicosilada from "../locales/es/glicosilada.json";
import esGlucemia from "../locales/es/glucemia.json";

import ptCommon from "../locales/pt/common.json";
import ptFooter from "../locales/pt/footer.json";
import ptNav from "../locales/pt/nav.json";
import ptLogin from "../locales/pt/login.json";
import ptHome from "../locales/pt/home.json";
import ptGlicosilada from "../locales/pt/glicosilada.json";
import ptGlucemia from "../locales/pt/glucemia.json";

import jaCommon from "../locales/ja/common.json";
import jaFooter from "../locales/ja/footer.json";
import jaNav from "../locales/ja/nav.json";
import jaLogin from "../locales/ja/login.json";
import jaHome from "../locales/ja/home.json";
import jaGlicosilada from "../locales/ja/glicosilada.json";
import jaGlucemia from "../locales/ja/glucemia.json";


// Agrupa tus recursos por idioma para facilitar la lectura
const resources = {
  en: { common: enCommon, nav: enNav, footer: enFooter, login: enLogin, home: enHome, glicosilada: enGlicosilada, glucemia: enGlucemia },
  es: { common: esCommon, nav: esNav, footer: esFooter, login: esLogin, home: esHome, glicosilada: esGlicosilada, glucemia: esGlucemia },
  pt: { common: ptCommon, nav: ptNav, footer: ptFooter, login: ptLogin, home: ptHome, glicosilada: ptGlicosilada, glucemia: ptGlucemia },
  ja: { common: jaCommon, nav: jaNav, footer: jaFooter, login: jaLogin, home: jaHome, glicosilada: jaGlicosilada, glucemia: jaGlucemia },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    ns: ["common", "nav", "footer", "login", "home", "glicosilada"],
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