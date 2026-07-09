// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// --- IMPORTACIONES ---

// Inglés (en)
import enCommon from "../locales/en/common.json";
import enFooter from "../locales/en/footer.json";
import enNav from "../locales/en/nav.json";
import enInsulina from "../locales/en/insulina.json";
import enInsulinaHistorial from "../locales/en/insulinaHistorial.json";
import enLogin from "../locales/en/login.json";
import enHome from "../locales/en/home.json";
import enGlicosilada from "../locales/en/glicosilada.json";
import enGlucemia from "../locales/en/glucemia.json";

// Español (es)
import esCommon from "../locales/es/common.json";
import esFooter from "../locales/es/footer.json";
import esNav from "../locales/es/nav.json";
import esInsulina from "../locales/es/insulina.json";
import esInsulinaHistorial from "../locales/es/insulinaHistorial.json";
import esLogin from "../locales/es/login.json";
import esHome from "../locales/es/home.json";
import esGlicosilada from "../locales/es/glicosilada.json";
import esGlucemia from "../locales/es/glucemia.json";

// Portugués (pt)
import ptCommon from "../locales/pt/common.json";
import ptFooter from "../locales/pt/footer.json";
import ptNav from "../locales/pt/nav.json";
import ptInsulina from "../locales/pt/insulina.json";
import ptInsulinaHistorial from "../locales/pt/insulinaHistorial.json";
import ptLogin from "../locales/pt/login.json";
import ptHome from "../locales/pt/home.json";
import ptGlicosilada from "../locales/pt/glicosilada.json";
import ptGlucemia from "../locales/pt/glucemia.json";

// Japonés (ja)
import jaCommon from "../locales/ja/common.json";
import jaFooter from "../locales/ja/footer.json";
import jaNav from "../locales/ja/nav.json";
import jaInsulina from "../locales/ja/insulina.json";
import jaInsulinaHistorial from "../locales/ja/insulinaHistorial.json";
import jaLogin from "../locales/ja/login.json";
import jaHome from "../locales/ja/home.json";
import jaGlicosilada from "../locales/ja/glicosilada.json";
import jaGlucemia from "../locales/ja/glucemia.json";

// --- RECURSOS UNIFICADOS ---
const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    footer: enFooter,
    insulina: enInsulina,
    insulinaHistorial: enInsulinaHistorial,
    login: enLogin,
    home: enHome,
    glicosilada: enGlicosilada,
    glucemia: enGlucemia,
  },
  es: {
    common: esCommon,
    nav: esNav,
    footer: esFooter,
    insulina: esInsulina,
    insulinaHistorial: esInsulinaHistorial,
    login: esLogin,
    home: esHome,
    glicosilada: esGlicosilada,
    glucemia: esGlucemia,
  },
  pt: {
    common: ptCommon,
    nav: ptNav,
    footer: ptFooter,
    insulina: ptInsulina,
    insulinaHistorial: ptInsulinaHistorial,
    login: ptLogin,
    home: ptHome,
    glicosilada: ptGlicosilada,
    glucemia: ptGlucemia,
  },
  ja: {
    common: jaCommon,
    nav: jaNav,
    footer: jaFooter,
    insulina: jaInsulina,
    insulinaHistorial: jaInsulinaHistorial,
    login: jaLogin,
    home: jaHome,
    glicosilada: jaGlicosilada,
    glucemia: jaGlucemia,
  },
};

// --- INICIALIZACIÓN DE I18NEXT ---
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    // Todos los namespaces agrupados en un solo array:
    ns: [
      "common",
      "nav",
      "footer",
      "insulina",
      "insulinaHistorial",
      "login",
      "home",
      "glicosilada",
      "glucemia",
    ],
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