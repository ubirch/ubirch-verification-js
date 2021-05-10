import i18n from 'i18next';
import { ELanguages } from '../models/models';
import * as widgetEn from '../assets/i18n/widget/en.json';
import * as widgetDe from '../assets/i18n/widget/de.json';
import * as verificationEn from '../assets/i18n/verification/en.json';
import * as verificationDe from '../assets/i18n/verification/de.json';

i18n.init({
  supportedLngs: Object.values(ELanguages),
  fallbackLng: ELanguages.en,
  ns: ['verification', 'widget'],
  resources: {
    en: {
      verification: verificationEn,
      widget: widgetEn
    },
    de: {
      verification: verificationDe,
      widget: widgetDe
    }
  }
});

export default i18n;
