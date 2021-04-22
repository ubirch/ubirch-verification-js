import i18n from 'i18next';
import { ELanguages } from '../models/models';

export interface Translations {
  [key: string]: string | { [key: string]: string };
}

export type TranslationMap = { [key in ELanguages]: Translations };

export const initTranslation = (translations: TranslationMap) =>
  i18n.init(
    {
      supportedLngs: Object.keys(ELanguages),
      fallbackLng: ELanguages.en,
      // allow keys to be phrases having `:`, `.`
      nsSeparator: false,
      keySeparator: false,
      resources: {
        en: {
          translation: translations.en,
        },
        de: {
          translation: translations.de,
        },
      },
      debug: false,
    },
    (err) => {
      if (err) {
        return console.log('Something went wrong loading translation files', err);
      }
    }
  );
