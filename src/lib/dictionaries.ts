
// src/lib/dictionaries.ts
import 'server-only'; // Ensures this runs only on the server for App Router
import type { DictionaryType } from '@/lib/types';

type Locale = 'en' | 'fr' | 'es' | 'it' | 'zh';

// We enumerate all dictionaries here for better linting and typescript support
// We load them dynamically to keep initial bundle sizes down.
const dictionaries: Record<Locale, () => Promise<DictionaryType>> = {
  en: () => import('@/locales/en.json').then(module => module.default as DictionaryType),
  fr: () => import('@/locales/fr.json').then(module => module.default as DictionaryType),
  es: () => import('@/locales/es.json').then(module => module.default as DictionaryType),
  it: () => import('@/locales/it.json').then(module => module.default as DictionaryType),
  zh: () => import('@/locales/zh.json').then(module => module.default as DictionaryType),
};

export const getDictionary = async (locale: Locale): Promise<DictionaryType> => {
  const load = dictionaries[locale] || dictionaries.en; // Fallback to English if locale is not found
  return load();
};

    