'use strict';

import i18n from 'i18next';
import { sha256 } from 'js-sha256';
import { sha512 } from 'js-sha512';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import * as de from './assets/i18n/de.json';
import * as en from './assets/i18n/en.json';
import environment from './environment';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  EError,
  EHashAlgorithms,
  EInfo,
  ELanguages,
  EStages,
  EUppStates,
  EVerificationState,
  IUbirchBlockchain,
  IUbirchBlockchainAnchor,
  IUbirchBlockchainAnchorProperties,
  IUbirchBlockchainAnchorRAW,
  IUbirchError,
  IUbirchInfo,
  IUbirchUpp,
  IUbirchVerificationConfig,
  IUbirchVerificationResponse,
  IUbirchVerificationResult,
} from './models';

i18n.init(
  {
    supportedLngs: ['en', 'de'],
    fallbackLng: 'en',
    // allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,
    resources: {
      en: {
        translation: en,
      },
      de: {
        translation: de,
      },
    },
    debug: false,
  },
  (err) => {
    if (err) {
      return console.log('something went wrong loading translation files', err);
    }
  }
);

const API_VERSION = '/v2';

export class UbirchVerification {
  private stage: EStages = EStages.prod;
  private algorithm: EHashAlgorithms = EHashAlgorithms.SHA256;
  private accessToken: string;
  private language?: ELanguages = ELanguages.en;
  private debug?: boolean = false;

  static createInstance(config: IUbirchVerificationConfig): UbirchVerification {
    return new UbirchVerification(config);
  }

  constructor(config: IUbirchVerificationConfig) {
    if (!config.accessToken) {
      this.handleError(EError.MISSING_ACCESS_TOKEN);
    }
    this.accessToken = config.accessToken;
    this.stage = config.stage || this.stage;
    this.algorithm = config.algorithm || this.algorithm;
    this.language = config.language || this.language;
    this.debug = config.debug !== undefined ? config.debug : this.debug;
  }

  private watcherSubject = new BehaviorSubject<IUbirchError | IUbirchInfo>(null);
  protected infoAndErrorWatcher$: Observable<
    IUbirchError | IUbirchInfo
  > = this.watcherSubject.asObservable();

  public watchInfosAndErrors(): Observable<IUbirchError | IUbirchInfo> {
    return this.infoAndErrorWatcher$;
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
    const transId: string = btoa(
      new Uint8Array(transIdAB).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return transId;
  }

  public verifyHash(hash: string): Promise<IUbirchVerificationResult> {
    const verificationResult: IUbirchVerificationResult = this.createInitialUbirchVerificationResult(
      hash
    );

    this.handleInfo(EInfo.START_VERIFICATION_CALL, hash);

    return new Promise((resolve, reject) => {
      this.sendVerificationRequest(hash)
        .then((response: any) => {
          try {
            this.handleInfo(EInfo.START_CHECKING_RESPONSE);

            const verificationResponse: IUbirchVerificationResponse = this.parseJSONResponse(
              response,
              hash
            );

            this.handleInfo(EInfo.RESPONSE_JSON_PARSED_SUCCESSFUL);

            const ubirchUpp: IUbirchUpp = this.extractUpp(verificationResponse);

            if (ubirchUpp) {
              verificationResult.upp = ubirchUpp;
              verificationResult.verificationState =
                EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL;

              this.handleInfo(EInfo.UPP_HAS_BEEN_FOUND);
            } else {
              // should never reach this block....
              this.handleError(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
            }

            // TODO: check that upp contains given hash
            // TODO: check signature, ...

            const blxAnchors: IUbirchBlockchainAnchor[] = this.checkBlockchainTXs(
              verificationResponse
            );

            if (blxAnchors.length > 0) {
              verificationResult.anchors = blxAnchors;
              verificationResult.upp.state = EUppStates.anchored;
              verificationResult.verificationState = EVerificationState.VERIFICATION_SUCCESSFUL;

              this.handleInfo(EInfo.BLXTXS_FOUND_SUCCESS);
            } else {
              verificationResult.verificationState =
                EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL;

              this.handleInfo(EInfo.NO_BLXTX_FOUND);
            }

            this.handleInfo(verificationResult.verificationState);
          } catch (err) {
            verificationResult.verificationState = EVerificationState.VERIFICATION_FAILED;
            if (err.code) {
              verificationResult.failReason = err.code;
            }
            reject(verificationResult);
          }

          resolve(verificationResult);
        })
        .catch((err) => {
          verificationResult.verificationState = EVerificationState.VERIFICATION_FAILED;

          verificationResult.failReason = err.code || EError.UNKNOWN_ERROR;
          reject(verificationResult);
        });
    });
  }

  public formatJSON(json: string, sort = true): string {
    try {
      const object: { [key: string]: any } = JSON.parse(json);
      return JSON.stringify(sort ? this.sortObjectRecursive(object, sort) : object);
    } catch (e) {
      this.handleError(EError.JSON_MALFORMED);
    }
  }

  protected handleError(errorCode: EError, hash?: string): void {
    const errorMsg: string = i18n.t(errorCode);

    const err: IUbirchError = {
      message: errorMsg,
      code: errorCode,
    };

    this.log(err);
    throw err;
  }

  protected handleInfo(infoCode: EInfo | EVerificationState, hash?: string): void {
    const infoMsg: string = i18n.t(infoCode);

    const info: IUbirchInfo = {
      message: infoMsg,
      code: infoCode,
    };

    this.log(info);
  }

  protected sendVerificationRequest(hash: string): Promise<any> {
    const self = this;
    const verificationUrl =
      environment.verify_api_url[this.stage] + API_VERSION + environment.verify_api_path;

    return new Promise(function (resolve) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', verificationUrl, true);

      xhr.onload = function () {
        if (this.readyState < 4) {
          self.handleInfo(EInfo.PROCESSING_VERIFICATION_CALL);
        } else {
          switch (this.status) {
            case 200: {
              resolve(xhr.response);
              break;
            }
            case 404: {
              self.handleError(EError.CERTIFICATE_ID_CANNOT_BE_FOUND);
              break;
            }
            case 403: {
              self.handleError(EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE);
              break;
            }
            case 500: {
              self.handleError(EError.INTERNAL_SERVER_ERROR);
              break;
            }
            default: {
              self.handleError(EError.UNKNOWN_ERROR);
              break;
            }
          }
        }
      };
      xhr.onerror = function () {
        self.handleError(EError.VERIFICATION_UNAVAILABLE);
      };

      xhr.setRequestHeader('Content-type', 'text/plain');
      xhr.setRequestHeader('authorization', 'bearer ' + self.accessToken);
      xhr.send(hash);
    }).catch((err) => Promise.reject(err));
  }

  protected parseJSONResponse(result: string, hash: string): IUbirchVerificationResponse {
    if (!result) {
      this.handleError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE, hash);
      return;
    }

    let resultObj: IUbirchVerificationResponse;

    try {
      resultObj = JSON.parse(result);
    } catch (e) {
      this.handleError(EError.JSON_PARSE_FAILED);
    }

    if (!resultObj) {
      this.handleError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE, hash);
      return;
    }
    return resultObj;
  }

  protected createInitialUbirchVerificationResult(hashP: string): IUbirchVerificationResult {
    const result: IUbirchVerificationResult = {
      hash: hashP,
      upp: undefined,
      anchors: [],
      verificationState: EVerificationState.VERIFICATION_PENDING,
    };

    return result;
  }

  protected extractUpp(resultObj: IUbirchVerificationResponse): IUbirchUpp {
    // Success IF
    // 2. Key Seal != ''

    if (!resultObj.upp || !resultObj.upp.length) {
      this.handleError(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
      return;
    }

    const ubirchUpp: IUbirchUpp = {
      upp: resultObj.upp,
      state: EUppStates.created,
    };

    return ubirchUpp;
  }

  protected checkBlockchainTXs(resultObj: IUbirchVerificationResponse): IUbirchBlockchainAnchor[] {
    // extract blockchain anchors and fill with given data from blockchain_settings

    const blxTXs = resultObj.anchors?.upper_blockchains;

    if (!blxTXs || !blxTXs.length) {
      return [];
    }

    const ubirchBlxTxAnchor: IUbirchBlockchainAnchor[] = blxTXs
      .map((rawAnchor: IUbirchBlockchainAnchorRAW) => this.createBlockchainAnchor(rawAnchor))
      .filter((probablyAnchor: IUbirchBlockchainAnchor) => probablyAnchor !== undefined);

    return ubirchBlxTxAnchor;
  }

  protected isBloxTXDataDefined(bloxTX: IUbirchBlockchainAnchorRAW): boolean {
    return (
      bloxTX?.properties?.blockchain?.length > 0 && bloxTX?.properties?.network_type?.length > 0
    );
  }

  protected createBlockchainAnchor(bloxTX: IUbirchBlockchainAnchorRAW): IUbirchBlockchainAnchor {
    if (!this.isBloxTXDataDefined(bloxTX)) {
      this.handleInfo(EInfo.WARNING_EMPTY_BLXTX_FOUND);

      return undefined;
    }

    const bloxTxProps: IUbirchBlockchainAnchorProperties = bloxTX.properties;

    const blockchain: string = bloxTxProps.blockchain;
    const networkType: string = bloxTxProps.network_type;

    const bloxTxData: IUbirchBlockchain = BlockchainSettings.blockchainSettings
      ? BlockchainSettings.blockchainSettings[blockchain]
      : undefined;

    if (!bloxTxData) {
      return undefined;
    }

    if (!bloxTxData.explorerUrl[networkType] || !bloxTxProps.txid) {
      return undefined;
    }

    // add transactionId to url
    const blxExplorerUrl: string = bloxTxData.explorerUrl[networkType].url + bloxTxProps.txid;
    const titleStr: string = bloxTxProps.network_info
      ? bloxTxProps.network_info
      : bloxTxProps.blockchain;
    const iconUrl: string = bloxTxData.nodeIcon ? bloxTxData.nodeIcon : undefined;

    const ubirchBlockchainAnchor: IUbirchBlockchainAnchor = {
      raw: bloxTxProps,
      txid: bloxTxProps.txid,
      networkInfo: bloxTxProps.network_info,
      networkType: networkType,
      timestamp: bloxTxProps.timestamp,
      iconUrl: iconUrl,
      blxTxExplorerUrl: blxExplorerUrl,
      label: titleStr,
    };

    return ubirchBlockchainAnchor;
  }

  protected sortObjectRecursive(object: unknown, sort: boolean): unknown {
    // recursive termination condition
    if (typeof object !== 'object' || Array.isArray(object)) {
      return object;
    } else {
      const objectSorted: { [key: string]: any } = {};
      const keysOrdered: { [key: string]: any } = sort
        ? Object.keys(object).sort()
        : Object.keys(object);

      keysOrdered.forEach(
        (key: string) => (objectSorted[key] = this.sortObjectRecursive(object[key], sort))
      );

      return objectSorted;
    }
  }

  protected log(logInfo: IUbirchInfo | IUbirchError): void {
    this.watcherSubject.next(logInfo);
  }
}

window['UbirchVerification'] = UbirchVerification;
