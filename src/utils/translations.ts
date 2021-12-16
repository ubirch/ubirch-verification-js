import i18n from 'i18next';
import { EUbirchLanguages } from '../models/models';
import * as en from '../assets/i18n/en.json';
import * as de from '../assets/i18n/de.json';

i18n.init({
  supportedLngs: Object.values(EUbirchLanguages),
  fallbackLng: EUbirchLanguages.en,
  ns: ['default'],
  resources: {
    en: {
      default: en,
    },
    de: { default: de }
  }
});

export default i18n;
