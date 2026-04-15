import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import cn from './cn.json';
import jp from './jp.json';
import es from './es.json';
import it from './it.json';
import ar from './ar.json';
import pt from './pt.json';
import ko from './ko.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      cn: { translation: cn },
      jp: { translation: jp },
      es: { translation: es },
      it: { translation: it },
      ar: { translation: ar },
      pt: { translation: pt },
      ko: { translation: ko },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
