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
import enRegister from "../locales/en/register.json";
import enForgotPassword from "../locales/en/forgotPassword.json";
import enCamino from "../locales/en/camino.json";
import enMonitoreoFisico from "../locales/en/monitoreoFisico.json";
import enProfile from "../locales/en/profile.json";
import enHbA1c from "../locales/en/hba1c.json";
import enNotifications from "../locales/en/notifications.json";
import enResetPassword from "../locales/en/resetPassword.json";

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
import esRegister from "../locales/es/register.json";
import esForgotPassword from "../locales/es/forgotPassword.json";
import esCamino from "../locales/es/camino.json";
import esMonitoreoFisico from "../locales/es/monitoreoFisico.json";
import esProfile from "../locales/es/profile.json";
import esHbA1c from "../locales/es/hba1c.json";
import esNotifications from "../locales/es/notifications.json";
import esResetPassword from "../locales/es/resetPassword.json";

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
import ptRegister from "../locales/pt/register.json";
import ptForgotPassword from "../locales/pt/forgotPassword.json";
import ptCamino from "../locales/pt/camino.json";
import ptMonitoreoFisico from "../locales/pt/monitoreoFisico.json";
import ptProfile from "../locales/pt/profile.json";
import ptHbA1c from "../locales/pt/hba1c.json";
import ptNotifications from "../locales/pt/notifications.json";
import ptResetPassword from "../locales/pt/resetPassword.json";

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
import jaRegister from "../locales/ja/register.json";
import jaForgotPassword from "../locales/ja/forgotPassword.json";
import jaCamino from "../locales/ja/camino.json";
import jaMonitoreoFisico from "../locales/ja/monitoreoFisico.json";
import jaProfile from "../locales/ja/profile.json";
import jaHbA1c from "../locales/ja/hba1c.json";
import jaNotifications from "../locales/ja/notifications.json";
import jaResetPassword from "../locales/ja/resetPassword.json";

// --- RECURSOS UNIFICADOS ---
const resources = {
  en: { common: enCommon, nav: enNav, footer: enFooter, insulina: enInsulina, insulinaHistorial: enInsulinaHistorial, login: enLogin, home: enHome, glicosilada: enGlicosilada, glucemia: enGlucemia, register: enRegister, forgotPassword: enForgotPassword, camino: enCamino, monitoreoFisico: enMonitoreoFisico, profile: enProfile, hba1c: enHbA1c, notifications: enNotifications, resetPassword: enResetPassword },
  es: { common: esCommon, nav: esNav, footer: esFooter, insulina: esInsulina, insulinaHistorial: esInsulinaHistorial, login: esLogin, home: esHome, glicosilada: esGlicosilada, glucemia: esGlucemia, register: esRegister, forgotPassword: esForgotPassword, camino: esCamino, monitoreoFisico: esMonitoreoFisico, profile: esProfile, hba1c: esHbA1c, notifications: esNotifications, resetPassword: esResetPassword },
  pt: { common: ptCommon, nav: ptNav, footer: ptFooter, insulina: ptInsulina, insulinaHistorial: ptInsulinaHistorial, login: ptLogin, home: ptHome, glicosilada: ptGlicosilada, glucemia: ptGlucemia, register: ptRegister, forgotPassword: ptForgotPassword, camino: ptCamino, monitoreoFisico: ptMonitoreoFisico, profile: ptProfile, hba1c: ptHbA1c, notifications: ptNotifications, resetPassword: ptResetPassword },
  ja: { common: jaCommon, nav: jaNav, footer: jaFooter, insulina: jaInsulina, insulinaHistorial: jaInsulinaHistorial, login: jaLogin, home: jaHome, glicosilada: jaGlicosilada, glucemia: jaGlucemia, register: jaRegister, forgotPassword: jaForgotPassword, camino: jaCamino, monitoreoFisico: jaMonitoreoFisico, profile: jaProfile, hba1c: jaHbA1c, notifications: jaNotifications, resetPassword: jaResetPassword },
};

// --- INICIALIZACIÓN DE I18NEXT ---
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    ns: ["common", "nav", "footer", "insulina", "login", "home", "glicosilada", "glucemia", "register", "forgotPassword", "camino", "monitoreoFisico", "profile", "hba1c", "notifications", "resetPassword"],
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