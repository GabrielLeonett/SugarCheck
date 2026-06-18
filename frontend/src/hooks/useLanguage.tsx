import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

// Banderas importación (si las usas)
import ES from "../assets/icons/ES.svg";
import JA from "../assets/icons/JA.svg";
import EN_US from "../assets/icons/EN-US.svg";
import PT from "../assets/icons/PT.svg";

const useLanguage = (ns?: string) => {
  const { i18n, t } = useTranslation(ns);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "es");

  // Memoizar la función para evitar recreaciones innecesarias
  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem("i18nextLng", lng);
      document.documentElement.lang = lng;
    },
    [i18n]
  );

  // Sincronizar el idioma cuando cambia en i18n
  useEffect(() => {
    const savedLanguage = localStorage.getItem("i18nextLng");
    const currentI18nLang = i18n.language;

    // Si hay un idioma guardado y es diferente al actual
    if (savedLanguage && savedLanguage !== currentI18nLang) {
      changeLanguage(savedLanguage);
    }

    // Siempre actualizar el estado con el idioma actual de i18n
    setCurrentLanguage(i18n.language);

    const handleLanguageChanged = (lng:string) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n, changeLanguage]); // Removido changeLanguage de dependencias para evitar loops

  // Configuración de idiomas disponibles
  const languages = useMemo(
    () => [
      {
        code: "es",
        name: "Español",
        flag: "🇪🇸",
        icon: ES,
      },
      {
        code: "en",
        name: "English",
        flag: "🇺🇸",
        icon: EN_US,
      },
      {
        code: "pt",
        name: "Português",
        flag: "🇵🇹",
        icon: PT,
      },
      {
        code: "ja",
        name: "日本語",
        flag: "🇯🇵",
        icon: JA,
      },
    ],
    []
  );

  // Encontrar el idioma actual basado en el código
  const currentLanguageInfo =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  // Verificar si un idioma está disponible
  const isLanguageAvailable = useCallback(
    (code: string) => {
      return languages.some((lang) => lang.code === code);
    },
    [languages]
  );

  // Cambiar al siguiente idioma disponible (útil para botones de toggle)
  const toggleLanguage = useCallback(() => {
    const currentIndex = languages.findIndex(
      (lang) => lang.code === currentLanguage
    );
    const nextIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[nextIndex].code);
  }, [currentLanguage, languages, changeLanguage]);

  return {
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    toggleLanguage,
    languages,
    isLanguageAvailable,
    t, // Atajo para traducciones
    language: i18n.language, // Exponer el idioma actual de i18n por si es necesario
  };
};

export default useLanguage;
