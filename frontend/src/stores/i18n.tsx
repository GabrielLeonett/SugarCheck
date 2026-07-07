// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones (agregar footer)
import enCommon from "../locales/en/common.json";
import enFooter from "../locales/en/footer.json";
import enNav from "../locales/en/nav.json";
import enInsulina from "../locales/en/insulina.json"
import enInsulinaHistorial from "../locales/en/insulinaHistorial.json"


import esCommon from "../locales/es/common.json";
import esFooter from "../locales/es/footer.json";
import esNav from "../locales/es/nav.json";
import esInsulina from "../locales/es/insulina.json";
import esInsulinaHistorial from "../locales/es/insulinaHistorial.json"

import ptCommon from "../locales/pt/common.json";
import ptFooter from "../locales/pt/footer.json";
import ptNav from "../locales/pt/nav.json";
import ptInsulina from "../locales/pt/insulina.json"
import ptInsulinaHistorial from "../locales/pt/insulinaHistorial.json"



import jaCommon from "../locales/ja/common.json";
import jaFooter from "../locales/ja/footer.json";
import jaNav from "../locales/ja/nav.json";
import jaInsulina from "../locales/ja/insulina.json"
import jaInsulinaHistorial from "../locales/ja/insulinaHistorial.json"




// Agrupa tus recursos por idioma para facilitar la lectura
const resources = {
  en: { common: enCommon, nav: enNav, footer: enFooter, insulina:enInsulina, insulinaHistorial:enInsulinaHistorial },
  es: { common: esCommon, nav: esNav, footer: esFooter, insulina:esInsulina, insulinaHistorial:esInsulinaHistorial },
  pt: { common: ptCommon, nav: ptNav, footer: ptFooter, insulina:ptInsulina, insulinaHistorial:ptInsulinaHistorial },
  ja: { common: jaCommon, nav: jaNav, footer: jaFooter, insulina:jaInsulina, insulinaHistorial:jaInsulinaHistorial },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    ns: ["common", "nav", "footer", "insulina"],
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