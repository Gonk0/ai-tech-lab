import type { Dictionary } from "./sk";
import { sk } from "./sk";
import { en } from "./en";
import type { Locale } from "./types";

const dictionaries: Record<Locale, Dictionary> = { sk, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? sk;
}

export type { Dictionary, Locale };
export { sk } from "./sk";
export { en } from "./en";
export { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE } from "./types";
export { DEFAULT_LOCALE as defaultLocale } from "./types";
