import { Injectable, Optional } from '@nestjs/common';
import { translations } from './translations/translations';

export type SupportedLanguage = 'es' | 'en' | 'pt' | 'ja';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['es', 'en', 'pt', 'ja'];

@Injectable()
export class TranslationService {
  private readonly translations = translations;

  constructor(@Optional() private readonly defaultLanguage: SupportedLanguage = 'es') {}

  translate(key: string, lang: string, params?: Record<string, string | number>): string {
    const langCode = this.resolveLanguage(lang);
    let message = this.translations[langCode]?.[key]
      ?? this.translations[this.defaultLanguage]?.[key]
      ?? key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        message = message.replace(`{{${k}}}`, String(v));
      }
    }

    return message;
  }

  translateDescription(key: string, lang: string): string {
    const descriptionKey = `${key}_DESCRIPTION`;
    const langCode = this.resolveLanguage(lang);
    return this.translations[langCode]?.[descriptionKey]
      ?? this.translations[this.defaultLanguage]?.[descriptionKey]
      ?? '';
  }

  resolveLanguage(lang: string): SupportedLanguage {
    if (!lang) return this.defaultLanguage;
    const base = lang.split('-')[0]?.toLowerCase();
    return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)
      ? base as SupportedLanguage
      : this.defaultLanguage;
  }
}
