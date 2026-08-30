import { en } from './en';
import { de } from './de';
import { DEFAULT_LOCALE, type Locale } from '~/config/locales';
import type { Dictionary } from './types';

export const dictionaries: Record<Locale, Dictionary> = { en, de };

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

export type { Dictionary };
