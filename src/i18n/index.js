import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";

import en from "./locales/en/translation.json";
import tr from "./locales/tr/translation.json";
import de from "./locales/de/translation.json";
import fr from "./locales/fr/translation.json";
import es from "./locales/es/translation.json";
import ar from "./locales/ar/translation.json";
import kmr from "./locales/kmr/translation.json";
import ckb from "./locales/ckb/translation.json";
import fa from "./locales/fa/translation.json";

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
  fa: { translation: fa },
  kmr: { translation: kmr },
  ckb: { translation: ckb },
};

const RTL_LANGS = ["ar", "fa"];
const fallbackLng = "en";

const normalizeLanguage = (tag) => {
  if (!tag) return null;
  const base = tag.split("-")[0];
  if (base === "ku") return "kmr";
  if (base === "ckb") return "ckb";
  if (resources[base]) return base;
  return null;
};

const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (Array.isArray(locales) && locales.length > 0) {
    const fromCode = normalizeLanguage(locales[0].languageCode);
    if (fromCode) return fromCode;
    const fromTag = normalizeLanguage(locales[0].languageTag);
    if (fromTag) return fromTag;
  }
  return fallbackLng;
};

const applyRTL = (lng) => {
  const shouldUseRTL = RTL_LANGS.includes(lng);
  // Her dil değişiminde yönü zorunlu güncelle.
  I18nManager.allowRTL(shouldUseRTL);
  I18nManager.forceRTL(shouldUseRTL);
};

const localeForFormatting = (lng) => {
  if (lng === "kmr") return "ku"; // Intl desteği için en yakın karşılık
  return lng || fallbackLng;
};

export const formatDate = (value, options) => {
  const lng = i18n.language || fallbackLng;
  return new Intl.DateTimeFormat(
    localeForFormatting(lng),
    options || { year: "numeric", month: "long", day: "numeric" }
  ).format(value);
};

export const formatNumber = (value, options) => {
  const lng = i18n.language || fallbackLng;
  return new Intl.NumberFormat(localeForFormatting(lng), options).format(value);
};

const initialLanguage = getDeviceLanguage();
applyRTL(initialLanguage);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng,
  supportedLngs: Object.keys(resources),
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v3",
});

i18n.on("languageChanged", (lng) => {
  applyRTL(lng);
});

export const availableLanguages = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "kmr", label: "Kurmancî" },
  { code: "ckb", label: "سۆرانی" },
];

export default i18n;
