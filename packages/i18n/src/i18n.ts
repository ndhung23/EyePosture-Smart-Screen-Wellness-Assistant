import { en } from './locales/en.js';
import { vi } from './locales/vi.js';

export type LanguageCode = 'en' | 'vi';

export type TranslationSchema = typeof en;

const locales: Record<LanguageCode, TranslationSchema> = {
  en,
  vi,
};

let currentLanguage: LanguageCode = 'en';

export function setLanguage(lang: LanguageCode): void {
  if (locales[lang]) {
    currentLanguage = lang;
  }
}

export function getLanguage(): LanguageCode {
  return currentLanguage;
}

export function getTranslations(lang?: LanguageCode): TranslationSchema {
  return locales[lang ?? currentLanguage];
}

/**
 * Resolves a dot-notated key with optional interpolation variables.
 * Example: t('dashboard.greeting', { name: 'Alex' })
 */
export function t(key: string, params?: Record<string, string | number>, lang?: LanguageCode): string {
  const activeLocale = locales[lang ?? currentLanguage] || locales.en;
  const parts = key.split('.');
  
  let current: unknown = activeLocale;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      // Fallback to English if missing in current locale
      let fallback: unknown = locales.en;
      for (const fallbackPart of parts) {
        if (fallback && typeof fallback === 'object' && fallbackPart in fallback) {
          fallback = (fallback as Record<string, unknown>)[fallbackPart];
        } else {
          return key; // return raw key if not found
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  let result = current;
  if (params) {
    for (const [paramKey, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    }
  }

  return result;
}
