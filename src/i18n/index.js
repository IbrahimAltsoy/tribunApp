import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import tr from "./locales/tr/translation.json";

const resources = {
  tr: { translation: tr },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "tr",
  fallbackLng: "tr",
  supportedLngs: ["tr"],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v3",
});

i18n.on("languageChanged", () => {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
});

export const availableLanguages = [
  { code: "tr", label: "Türkçe" },
];

export default i18n;
