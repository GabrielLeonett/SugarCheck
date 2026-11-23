/**
 * Utilidades de consentimiento de cookies y almacenamiento local.
 *
 * - `necessary`: cookies de sesión (HttpOnly) y el propio registro de consentimiento.
 * - `preferences`: idioma y tema visual guardados en localStorage.
 */

export const COOKIE_CONSENT_STORAGE_KEY = "sugarcheck_cookie_consent_v1";
export const OPEN_COOKIE_PREFERENCES_EVENT = "sugarcheck:open-cookie-preferences";

const PREFERENCE_STORAGE_KEYS = ["theme", "i18nextLng"] as const;

export interface CookieConsentRecord {
  necessary: true;
  preferences: boolean;
  updatedAt: string;
}

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CookieConsentRecord>;
    if (parsed?.necessary !== true) {
      return null;
    }

    return {
      necessary: true,
      preferences: Boolean(parsed.preferences),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: boolean): CookieConsentRecord {
  const record: CookieConsentRecord = {
    necessary: true,
    preferences,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));

    if (!preferences) {
      PREFERENCE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }
  }

  return record;
}

/**
 * Indica si el usuario ha autorizado el almacenamiento de preferencias.
 * Mientras no exista una decisión guardada se asume que solo se permiten
 * las cookies estrictamente necesarias.
 */
export function arePreferenceCookiesAllowed(): boolean {
  return readCookieConsent()?.preferences === true;
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}
