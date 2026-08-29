import { en } from './en';
import type { Dictionary } from './types';

export const dictionaries = { en } satisfies Record<string, Dictionary>;

export type LocaleKey = keyof typeof dictionaries;

export const getDictionary = (locale: string): Dictionary =>
  dictionaries[locale as LocaleKey] ?? dictionaries.en;

export type { Dictionary };
