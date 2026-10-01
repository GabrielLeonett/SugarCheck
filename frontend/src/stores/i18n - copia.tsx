// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones (agregar footer)
import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";
import enHero from "../locales/en/hero.json";
import enSkills from "../locales/en/skills.json";
import enFooter from "../locales/en/footer.json";

import esHero from "../locales/es/hero.json";
import esSkills from "../locales/es/skills.json";
import esFooter from "../locales/es/footer.json";

import ptHero from "../locales/pt/hero.json";
import ptSkills from "../locales/pt/skills.json";
import ptFooter from "../locales/pt/footer.json";

import jaHero from "../locales/ja/hero.json";
import jaSkills from "../locales/ja/skills.json";
import jaFooter from "../locales/ja/footer.json";

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    hero: enHero,
    skills: enSkills,
    footer: enFooter,
  },
  es: {
    hero: esHero,
    skills: esSkills,
    footer: esFooter,
  },
  pt: {
    hero: ptHero,
    skills: ptSkills,
    footer: ptFooter,
  },
  ja: {
    hero: jaHero,
    skills: jaSkills,
    footer: jaFooter,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    defaultNS: "common",
    ns: ["common", "nav", "hero", "skills", "footer"], // Agregar footer
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