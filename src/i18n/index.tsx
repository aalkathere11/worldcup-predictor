'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Locale } from '@/types';

type TranslationKey = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations: Record<Locale, Record<string, unknown>> = {
  ar: {} as Record<string, unknown>,
  en: {} as Record<string, unknown>,
};

// Lazy load translations
async function loadTranslations(locale: Locale) {
  if (Object.keys(translations[locale]).length === 0) {
    const data = await import(`./${locale}.json`);
    translations[locale] = data.default;
  }
  return translations[locale];
}

// Get nested key from object
function getNestedValue(obj: Record<string, unknown>, keyPath: string): string {
  const keys = keyPath.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return keyPath; // Return key as fallback
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : keyPath;
}

// Interpolate template params like {{name}}
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'ar' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || defaultLocale;
    }
    return defaultLocale;
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load both locales
    Promise.all([loadTranslations('ar'), loadTranslations('en')]).then(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    // Apply dir attribute to document
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.classList.toggle('font-arabic', locale === 'ar');
    localStorage.setItem('locale', locale);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (!loaded) return key;
      const value = getNestedValue(translations[locale] as Record<string, unknown>, key);
      return interpolate(value, params);
    },
    [locale, loaded]
  );

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

// Format date to Makkah timezone
export function formatMakkahDate(isoString: string, locale: Locale): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    timeZone: 'Asia/Riyadh',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMakkahTime(isoString: string, locale: Locale): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

