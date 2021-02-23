'use strict';

import * as i18next from 'i18next';
import { sha256 } from 'js-sha256';
import { sha512 } from 'js-sha512';
import * as de from './assets/i18n/de.json';
import * as en from './assets/i18n/en.json';
import environment from './environment';
import { EError, EHashAlgorithms, EInfo, ELanguages, EStages, IUbirchError, IUbirchInfo, IUbirchVerificationConfig, IUbirchVerificationResponse } from './models';

const i18Next: i18next.i18n = i18next as any as i18next.i18n;

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

const VERSION = 'v2/';

export class UbirchVerification {
  private stage: EStages = EStages.prod;
  private algorithm: EHashAlgorithms = EHashAlgorithms.SHA256;
  private accessToken: string;
  private language?: ELanguages = ELanguages.en;
  private debug?: boolean = false;


  constructor(config: IUbirchVerificationConfig) {
    if (!config.accessToken) {
      this.handleError(EError.MISSING_ACCESS_TOKEN);
    }
    this.accessToken = config.accessToken;
    this.stage = config.stage || this.stage;
    this.algorithm = config.algorithm || this.algorithm;
    this.language = config.language || this.language;
    this.debug = config.debug !== undefined ? config.debug : this.debug;
    return this;
  }

  public createHash(json: string, hashAlgorithm: EHashAlgorithms = this.algorithm): string {
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

    const errorMsg: string = i18Next.t(errorCode);

    const err: IUbirchError = {
      message: errorMsg,
      code: errorCode,
    };

    this.log(err);
    throw err;
  }

  protected handleInfo(infoCode: EInfo, hash?: string): void {

    const infoMsg: string = i18Next.t(infoCode);

    const info: IUbirchInfo = {
      message: infoMsg,
      code: infoCode,
    };

    this.log(info);
  }

  private sendVerificationRequest(hash: string): void {
    const xhttp: XMLHttpRequest = new XMLHttpRequest();
    const self = this;

    xhttp.onreadystatechange = function() {
      if (this.readyState < 4) {
        self.handleInfo(EInfo.PROCESSING_VERIFICATION_CALL);
      } else {
        switch (this.status) {
          case 200: {
            self.checkResponse(this.responseText, hash);
            break;
          }
          case 404: {
            self.handleError(EError.CERTIFICATE_ID_CANNOT_BE_FOUND, hash);
            break;
          }
          case 403: {
            self.handleError(EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE, hash);
            break;
          }
          default: {
            self.handleError(EError.UNKNOWN_ERROR, hash);
            break;
          }
        }
      }
    };

    const verificationUrl = environment.verify_api_url[this.stage] + VERSION + environment.verify_api_path;

    this.handleInfo(EInfo.START_VERIFICATION_CALL, hash);

    xhttp.open('POST', verificationUrl, true);
    xhttp.setRequestHeader('Content-type', 'text/plain');
    xhttp.setRequestHeader('authorization', 'bearer ' + this.accessToken);
    xhttp.send(hash);
  }

  private checkResponse(result: string, hash: string): void {
    this.handleInfo(EInfo.START_CHECKING_RESPONSE, hash);
    // Success IF
    // 1. HTTP Status 200 -> if this fkt is called and result isn't empty
    // 2. Key Seal != ''

    if (!result) {
      this.handleError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE, hash);
      return;
    }

    const resultObj: IUbirchVerificationResponse = JSON.parse(result);

    if (!resultObj) {
      this.handleError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE, hash);
      return;
    }

    const seal = resultObj.upp;

    if (!seal || !seal.length) {
      this.handleError(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE, hash);
      return;
    }

    this.handleInfo(EInfo.VERIFICATION_SUCCESSFUL, hash);

    const blockchainTX = resultObj.anchors.upper_blockchains;

    if (!blockchainTX || !blockchainTX.length) {
      this.handleInfo(EInfo.NO_BLXTX_FOUND, hash);
      return;
    }

    this.handleInfo(EInfo.BLXTX_FOUND_SUCCESS, hash);

    // show it for each item in array
    // blockchainTX.forEach((item, index) => {
    //   if (!item || !item.properties) {
    //     return;
    //   }
    //
    //   this.extractBloxTXIcon(item.properties, index);
    // });
  }

/*  private extractBloxTXIcon(bloxTX: IUbirchVerificationAnchorProperties, index: number): void {
    if (!bloxTX) {
      return;
    }

    const blockchain: string = bloxTX.blockchain;
    const networkType: string = bloxTX.network_type;

    if (!blockchain || !networkType) {
      return;
    }

    const blox: IUbirchBlockchain =
      BlockchainSettings.blockchainSettings ? BlockchainSettings.blockchainSettings[ blockchain ] : undefined;

    if (!blox || !bloxTX.txid) {
      return;
    }

    const bloxTXData: IUbirchBlockchainNet =
      blox.explorerUrl[ networkType ];

    const linkTag: HTMLElement = document.createElement('a');

    // add transactionId to url
    if (bloxTXData.url) {
      linkTag.setAttribute('href', bloxTXData.url + bloxTX.txid);
    }

    const titleStr: string = bloxTX.network_info ? bloxTX.network_info : bloxTX.blockchain;

    linkTag.setAttribute('title', titleStr);
    linkTag.setAttribute('target', '_blanc');

    // if icon url is given add img, otherwise add text
    if (blox.nodeIcon) {
      const iconId = `blockchain_transid_check${index === undefined ? '' : '_' + index}`;
      linkTag.appendChild(this.createIconTag(environment.assets_url_prefix + blox.nodeIcon, iconId));
    } else {
      linkTag.innerHTML = titleStr;
    }

    this.resultOutput.appendChild(linkTag);
  }
*/

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

  private log(logInfo: IUbirchInfo | IUbirchError): void {
    console.log(logInfo.message);
  }
}

module.exports = { UbirchVerification };
