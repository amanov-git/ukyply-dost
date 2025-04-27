import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationRU from "locales/ru/translation.json";
import translationTM from "locales/tm/translation.json";
import translationEN from "locales/en/translation.json";


// the translations
const resources = {
  ru: {
    translation: translationRU,
  },
  en: {
    translation: translationEN,
  },
  tm: {
    translation: translationTM,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "tm",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
