import type { i18n } from "i18next";

export type LanguageCode =
  | "tr"
  | "en"
  | "de"
  | "fr"
  | "es"
  | "ar"
  | "fa"
  | "kmr"
  | "ckb";

export type AvailableLanguage = {
  code: LanguageCode;
  label: string;
};

export const availableLanguages: readonly AvailableLanguage[];

export function formatDate(
  value: Date | number,
  options?: Intl.DateTimeFormatOptions
): string;

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string;

declare const i18nInstance: i18n;

export default i18nInstance;
