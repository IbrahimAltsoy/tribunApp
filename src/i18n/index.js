import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";

import en from "./locales/en/translation.json";
import tr from "./locales/tr/translation.json";
import ku from "./locales/kmr/translation.json"; // Backend'de "ku" olarak kullanılıyor

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  ku: { translation: ku }, // Backend ile eşleşmesi için "ku" olarak
};

const RTL_LANGS = []; // Artık RTL dil yok
const fallbackLng = "en";

const normalizeLanguage = (tag) => {
  if (!tag) return null;
  const base = tag.split("-")[0];
  // Cihaz dilinde "ku" gelirse backend ile eşleşmesi için "ku" döndür
  if (base === "ku") return "ku";
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
  // "ku" Intl formatında kullanılabilir
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
  { code: "ku", label: "Kurdî" }, // Backend ile eşleşen kod
];

export default i18n;
