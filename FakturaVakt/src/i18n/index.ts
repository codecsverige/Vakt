import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import ar from './ar';
import en from './en';
import sv from './sv';

export const resources = {
  en: { translation: en },
  sv: { translation: sv },
  ar: { translation: ar },
} as const;

export type SupportedLanguage = keyof typeof resources;

const findDeviceLanguage = (): SupportedLanguage => {
  const locales = RNLocalize.getLocales();

  if (Array.isArray(locales)) {
    const match = locales.find((locale) =>
      ['sv', 'ar', 'en'].includes(locale.languageCode),
    );

    if (match) {
      return match.languageCode as SupportedLanguage;
    }
  }

  return 'en';
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: findDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export const supportedLanguages: Array<{ code: SupportedLanguage; label: string }> =
  [
    { code: 'sv', label: 'Svenska' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
  ];

export const changeLanguage = (code: SupportedLanguage) => i18n.changeLanguage(code);

export default i18n;
