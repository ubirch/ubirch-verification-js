'use strict';

import { EError, EHashAlgorithms, IUbirchError } from './models';
import { sha256 } from 'js-sha256';
import { sha512 } from 'js-sha512';
import * as i18next from 'i18next';

const i18Next: i18next.i18n = i18next as any as i18next.i18n;
import * as en from './assets/i18n/en.json';
import * as de from './assets/i18n/de.json';

i18Next.init({
  supportedLngs: [ 'en', 'de' ],
  fallbackLng: 'en',
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,
  resources: {
    en: {
      translation: en
    },
    de: {
      translation: de
    }
  },
  debug: false,
}, (err, t) => {
  if (err) {
    return console.log('something went wrong loading translation files', err);
  }
});

export class UbirchVerification {

  constructor() {
    return this;
  }

  public createHash(json: string, hashAlgorithm: EHashAlgorithms = EHashAlgorithms.SHA256): string {
    let transIdAB: ArrayBuffer;

    switch (hashAlgorithm) {
      case EHashAlgorithms.SHA256: {
        transIdAB = sha256.arrayBuffer(json);
        break;
      }
      case EHashAlgorithms.SHA512: {
        transIdAB = sha512.arrayBuffer(json);
        break;
      }
    }
    const transId: string = btoa(new Uint8Array(transIdAB).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    return transId;
  }

  public formatJSON(json: string, sort: boolean = true): string {
    try {
      const object: object = JSON.parse(json);
      return JSON.stringify(sort ? this.sortObjectRecursive(object, sort) : object);
    } catch (e) {
      this.handleError(EError.JSON_MALFORMED);
    }
  }

  protected handleError(errorCode: EError, hash?: string): void {

    const errorMsg: string = i18Next.t(errorCode + '.info');

    const err: IUbirchError = {
      message: errorMsg,
      code: errorCode,
    };

    this.logError(err.message);
    throw err;
  }

  private logError(errorStr: string): void {
    console.log(errorStr);
  }

  private sortObjectRecursive(object: any, sort: boolean): object {
    // recursive termination condition
    if (typeof (object) !== 'object' || Array.isArray(object)) {
      return object;
    } else {
      const objectSorted: { [ key: string ]: any } = {};
      const keysOrdered: { [ key: string ]: any } = sort ? Object.keys(object).sort() : Object.keys(object);

      keysOrdered.forEach((key: string) => objectSorted[ key ] = this.sortObjectRecursive(object[ key ], sort),
      );

      return objectSorted;
    }
  }
}

module.exports = { UbirchVerification };
