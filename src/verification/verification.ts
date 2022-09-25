import UbirchProtocol from '@ubirch/ubirch-protocol-verifier/src/upp';
import { sha256 } from 'js-sha256';
import { sha512 } from 'js-sha512';
import { BehaviorSubject, Observable } from 'rxjs';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import environment from '../environment';
import {
  EBlxAnchors,
  EError,
  EInfo,
  EUbirchHashAlgorithms,
  EUbirchLanguages,
  EUbirchMessageTypes,
  EUbirchStages,
  EUbirchVerificationStateKeys,
  EUbirchVerificationTreeNodeType,
  EUppStates,
  EUppTypes,
  IUbirchBlockchain,
  IUbirchBlockchainAnchor,
  IUbirchBlockchainAnchorProperties,
  IUbirchBlockchainAnchorRAW,
  IUbirchBlockChainVersion,
  IUbirchError,
  IUbirchErrorDetails,
  IUbirchInfo,
  IUbirchUpp,
  IUbirchVerificationResult,
  IUbirchVerificationConfig,
  IUbirchVerificationResponse,
  IUbirchVerificationState,
  IUbirchVerificationTreeNode,
  UbirchMessage,
} from '../models/models';
import i18n from '../utils/translations';

const API_VERSION = '/v2';

export class UbirchVerification {

  protected stage: EUbirchStages = EUbirchStages.prod;
  protected algorithm: EUbirchHashAlgorithms = EUbirchHashAlgorithms.SHA256;
  protected accessToken: string;
  protected language?: EUbirchLanguages = EUbirchLanguages.en;

  protected messageSubject$: BehaviorSubject<UbirchMessage> = new BehaviorSubject<UbirchMessage>(null);
  private messenger$: Observable<UbirchMessage> = this.messageSubject$.asObservable();

  constructor(config: IUbirchVerificationConfig) {
    if (!config.accessToken) {
      this.handleError(EError.MISSING_ACCESS_TOKEN);
    }
    this.accessToken = config.accessToken;
    this.stage = config.stage || this.stage;
    this.algorithm = config.algorithm || this.algorithm;
    this.language = config.language || this.language;
  }

  public async verifyUPP(packedSignedUpp: string, uppType: EUppTypes = EUppTypes.SIGNED): Promise<IUbirchVerificationResult> {
    const verificationResult: IUbirchVerificationResult = this.createInitialUbirchVerificationResult();

    this.handleVerificationState(EUbirchVerificationStateKeys.VERIFICATION_PENDING);
    this.handleInfo(EInfo.START_CHECKING_TYPE);

    try {
      switch (uppType) {
        case EUppTypes.SIGNED:

          const msgPackUpp = UbirchProtocol.tools.unpackSignedUpp(packedSignedUpp);
          const msgpackPayload = UbirchProtocol.tools.getMsgPackPayloadFromUpp(msgPackUpp);
          const hash = UbirchProtocol.tools.getHashedPayload(msgpackPayload);
          verificationResult.hash = hash;

          const resp = await this.verifyHash(hash, false, uppType);

          // TODO: extract and display verified data from msgPack payload
          const data = UbirchProtocol.tools.getJSONFromMsgPackPayload(msgpackPayload);
          // TODO: add data to result
          verificationResult.upp = resp.upp;
          verificationResult['certdata'] = data;
          verificationResult.verificationState = resp.verificationState;
          break;
        case EUppTypes.CHAINED:
        default:
          verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_FAILED;
          verificationResult.failed = {
            code: EError.NOT_YET_IMPLEMENTED
          };
      }

      this.handleVerificationState(verificationResult.verificationState, verificationResult);
      return verificationResult;

    } catch (err) {
      verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_FAILED;
      verificationResult.failed = {
        code: err.code || EError.UNKNOWN_ERROR,
        message: err.message,
        errorBECodes: err.errorBECodes
      };

      this.handleVerificationState(verificationResult.verificationState, verificationResult);
      return verificationResult;
    }

  }

  public async verifyHash(hash: string, verbose = false, uppType: EUppTypes = EUppTypes.CHAINED): Promise<IUbirchVerificationResult> {
    const verificationResult: IUbirchVerificationResult = this.createInitialUbirchVerificationResult(
      hash
    );

    this.handleVerificationState(EUbirchVerificationStateKeys.VERIFICATION_PENDING);
    this.handleInfo(EInfo.START_VERIFICATION_CALL);

    try {
      const verificationResponse: IUbirchVerificationResponse = await this.sendVerificationRequest(hash);

      this.handleInfo(EInfo.START_CHECKING_RESPONSE);

      const ubirchUpp: IUbirchUpp = this.extractUpp(verificationResponse, uppType);

      verificationResult.upp = ubirchUpp;
      verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL;

      this.handleInfo(EInfo.UPP_HAS_BEEN_FOUND);

      const hwDeviceId = this.getHWDeviceId(ubirchUpp.upp);
      await this.verifySignature(ubirchUpp.upp, hwDeviceId);

      // const deviceName = await this.getDeviceName(hwDeviceId);

      switch (uppType) {
        case EUppTypes.SIGNED:
          verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL;
          break;
        case EUppTypes.CHAINED:
        default:
          const blxAnchors: IUbirchBlockchainAnchor[] = this.checkBlockchainTXs(verificationResponse);

          if (blxAnchors.length > 0) {
            const firstAnchorTimestamp = this.findFirstAnchorTimestamp(blxAnchors);
            const creationTimestamp = this.getCreationTimestamp(verificationResponse);

            if (verbose) {
              verificationResult.rawData = verificationResponse;
              verificationResult.lowerAnchors = this.checkBlockchainTXs(verificationResponse, EBlxAnchors.lower_blockchains);
            }

            verificationResult.anchors = blxAnchors;
            verificationResult.creationTimestamp = creationTimestamp;
            verificationResult.firstAnchorTimestamp = firstAnchorTimestamp;
            verificationResult.upp.state = EUppStates.anchored;

            verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_SUCCESSFUL;
            this.handleInfo(EInfo.BLXTXS_FOUND_SUCCESS);
          } else {

            verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_PARTLY_SUCCESSFUL;
            this.handleInfo(EInfo.NO_BLXTX_FOUND);
          }

      }

      this.handleVerificationState(verificationResult.verificationState, verificationResult);
      return verificationResult;
    } catch (err) {
      verificationResult.verificationState = EUbirchVerificationStateKeys.VERIFICATION_FAILED;
      verificationResult.failed = {
        code: err.code || EError.UNKNOWN_ERROR,
        message: err.message,
        errorBECodes: err.errorBECodes
      };
      this.handleVerificationState(verificationResult.verificationState, verificationResult);
      return verificationResult;
    }
  }

  public get messenger(): Observable<UbirchMessage> {
    return this.messenger$;
  }

  public formatJSON(json: string, sort = true): string {
    try {
      const object: { [key: string]: any } = JSON.parse(json);
      return JSON.stringify(sort ? this.sortObjectRecursive(object) : object);
    } catch (e) {
      this.handleError(EError.JSON_MALFORMED, { errorMessage: e.message });
    }
  }

  public createHash(json: string, hashAlgorithm: EUbirchHashAlgorithms = this.algorithm, leaveUntouched = false): string {
    let transIdAB: ArrayBuffer;
    const formatedJson = leaveUntouched ? json : this.formatJSON(json);

    switch (hashAlgorithm) {
      case EUbirchHashAlgorithms.SHA256: {
        transIdAB = sha256.arrayBuffer(formatedJson);
        break;
      }
      case EUbirchHashAlgorithms.SHA512: {
        transIdAB = sha512.arrayBuffer(formatedJson);
        break;
      }
    }
    const transId: string = btoa(
      new Uint8Array(transIdAB).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return transId;
  }

  public setLanguage(language: EUbirchLanguages): void {
    i18n.changeLanguage(language);
  }

  protected getHWDeviceId(upp: string): string {
    try {
      const decodedUpp = UbirchProtocol.tools.upp(upp);
      const hwDeviceId = UbirchProtocol.tools.getUUIDFromUpp(decodedUpp);
      return hwDeviceId;
    } catch (e) {
      this.handleError(EError.VERIFICATION_FAILED_CANNOT_DECODE_HWDEVICEID_FROM_UPP);
    }
  }

  protected verifyDevice(pubKey: string, upp: string): boolean {
    try {
      return UbirchProtocol.verify(pubKey, upp);
    } catch (e) {
      this.handleError(EError.VERIFICATION_FAILED_DEVICE_PUBKEY_CANNOT_BE_VERIFIED)
    }
  }

  protected async verifySignature(upp: string, hwDeviceId: string): Promise<void> {
    try {
      const pubKey = await this.getPubKey(hwDeviceId);
      const verified = !!pubKey && this.verifyDevice(pubKey, upp);

      if (!verified) {
        this.handleError(EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED);
      }
      this.handleInfo(EInfo.SIGNATURE_VERIFICATION_SUCCESSFULLY);
    } catch (e) {
      this.handleError(EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED);
    }
  }

  protected handleError(code: EError, errorDetails?: IUbirchErrorDetails, errorCodeFromBE?: string[]): void {
    let errorMsg: string = '';
    if (errorCodeFromBE) {
      errorCodeFromBE.forEach(code => {
        const msg = this.verifiedLangStr(`default:error.${code}`);
        errorMsg += errorMsg.length > 0 ? '\n' + msg : msg;
      })
    } else {
      errorMsg = code === (EError.VERIFICATION_UNAVAILABLE) && errorDetails
        ? i18n.t(`default:error.${code}`, { message: errorDetails.errorMessage })
        : i18n.t(`default:error.${code}`);
    }

    const err: IUbirchError = {
      type: EUbirchMessageTypes.ERROR,
      message: errorMsg.length > 0 ? errorMsg : undefined,
      code,
      errorBECodes: errorCodeFromBE,
      errorDetails,
    };

    this.log(err);
    throw err;
  }

  protected handleInfo(code: EInfo): void {
    const infoMsg: string = i18n.t(`default:info.${code}`);

    const info: IUbirchInfo = {
      type: EUbirchMessageTypes.INFO,
      message: infoMsg,
      code,
    };

    this.log(info);
  }

  protected handleVerificationState(
    code: EUbirchVerificationStateKeys,
    result?: IUbirchVerificationResult
  ): void {
    const infoMsg: string = i18n.t(`default:verification-state.${code}`);

    const info: IUbirchVerificationState = {
      type: EUbirchMessageTypes.VERIFICATION_STATE,
      message: infoMsg,
      code,
      result,
    };

    this.log(info);
  }

  protected async sendVerificationRequest(hash: string): Promise<IUbirchVerificationResponse> {
    const self = this;
    const verificationUrl =
      environment.verify_api_url[this.stage] + '/api' + API_VERSION + environment.verify_api_path;

    const headers = {
      'Content-type': 'text/plain',
      authorization: 'bearer ' + self.accessToken,
    };

    return fetch(verificationUrl, { headers, method: 'POST', body: hash })
      .catch((err) => err.message as string)
      .then((response) => {
        if (typeof response === 'string') {
          return self.handleError(EError.VERIFICATION_UNAVAILABLE, { errorMessage: response });
        }

        switch (response.status) {
          case 200: {
            return response.json();
          }
          case 404: {
            self.handleError(EError.CERTIFICATE_ID_CANNOT_BE_FOUND);
          }
          case 403: {
            self.handleError(EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE);
          }
          case 500: {
            self.handleError(EError.INTERNAL_SERVER_ERROR);
          }
          default: {
            self.handleError(EError.UNKNOWN_ERROR);
          }
        }
      });
  }

  protected async getPubKey(hwDeviceId: string): Promise<string> {
    const self = this;
    const keyServiceUrl = `${environment.key_service_url[this.stage]}${hwDeviceId}`;

    const headers = {
      'Content-type': 'text/plain',
      authorization: 'bearer ' + self.accessToken,
    };

    return fetch(keyServiceUrl, { headers })
      .catch((err) => err.message as string)
      .then((response) => {
        if (typeof response === 'string') {
          return self.handleError(EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED, {
            errorMessage: response,
          });
        }

        if (response.status === 200) {
          return response.json();
        }

        self.handleError(EError.VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED);
      })
      .then((json) => json[0].pubKeyInfo.pubKey);
  }

  // protected async getDeviceName(hwDeviceId: string): Promise<string> {
  //   const self = this;
  //   const deviceServiceUrl = `${environment.device_service_url[this.stage]}${hwDeviceId}`;

  //   const headers = {
  //     'Content-type': 'text/plain',
  //     authorization: 'bearer ' + self.accessToken,
  //   };

  //   return fetch(deviceServiceUrl, { headers })
  //     .catch((err) => err.message as string)
  //     .then((response) => {
  //       if (typeof response === 'string') {
  //         return self.handleError(EError.VERIFICATION_UNAVAILABLE, { errorMessage: response });
  //       }

  //       if (response.status === 200) {
  //         return response.json();
  //       }

  //       self.handleError(EError.UNKNOWN_ERROR);
  //     })
  //     .then((json) => json);
  // }

  protected createInitialUbirchVerificationResult(hash?: string): IUbirchVerificationResult {
    const result: IUbirchVerificationResult = {
      verificationState: EUbirchVerificationStateKeys.VERIFICATION_PENDING,
    };
    if (hash) {
      result.hash = hash;
    }
    return result;
  }

  protected extractUpp(resultObj: IUbirchVerificationResponse, uppType: EUppTypes = EUppTypes.CHAINED): IUbirchUpp {
    // Success IF
    // 2. Key Seal != ''

    if (!resultObj.upp || !resultObj.upp.length) {
      this.handleError(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
    }

    const ubirchUpp: IUbirchUpp = {
      upp: resultObj.upp,
      type: uppType,
      state: EUppStates.created,
    };

    return ubirchUpp;
  }

  protected checkBlockchainTXs(resultObj: IUbirchVerificationResponse, whichBlx = EBlxAnchors.upper_blockchains): IUbirchBlockchainAnchor[] {
    // extract blockchain anchors and fill with given data from blockchain_settings

    const blxTXs = whichBlx === EBlxAnchors.upper_blockchains ? resultObj.anchors?.upper_blockchains : resultObj.anchors?.lower_blockchains;

    if (!blxTXs || !blxTXs.length) {
      return [];
    }

    const ubirchBlxTxAnchors: IUbirchBlockchainAnchor[] = blxTXs
      .map((rawAnchor: IUbirchBlockchainAnchorRAW) =>
        this.createBlockchainAnchor(rawAnchor))
      .filter((probablyAnchor: IUbirchBlockchainAnchor) =>
        probablyAnchor !== undefined);

    return ubirchBlxTxAnchors;
  }

  protected getCreationTimestamp (resultObj: IUbirchVerificationResponse): string {

    const upperPath: IUbirchVerificationTreeNode[] = resultObj.anchors?.upper_path;

    const uppData: IUbirchVerificationTreeNode = upperPath?.length > 0 ? upperPath[0] : undefined;

    return (uppData && uppData.label === EUbirchVerificationTreeNodeType.UPP) ? uppData.properties?.timestamp : undefined;
  }

  protected findFirstAnchorTimestamp(ubirchBlxTxAnchors: IUbirchBlockchainAnchor[]): string | null {
    const timestamps = ubirchBlxTxAnchors
      .map(({ timestamp }) => Date.parse(timestamp))
      .sort((a, b) => a - b)
      .map((unix) => new Date(unix).toISOString());

    return timestamps[0] || null;
  }

  protected isBloxTXDataDefined(bloxTX: IUbirchBlockchainAnchorRAW): boolean {
    return (
      bloxTX.properties &&
      bloxTX.properties.blockchain?.length > 0 &&
      bloxTX.properties.network_type?.length > 0
    );
  }

  protected createBlockchainAnchor(bloxTX: IUbirchBlockchainAnchorRAW): IUbirchBlockchainAnchor {
    if (!this.isBloxTXDataDefined(bloxTX)) {
      this.handleInfo(EInfo.WARNING_EMPTY_BLXTX_FOUND);

      return undefined;
    }

    const bloxTxProps: IUbirchBlockchainAnchorProperties = bloxTX.properties;

    const blockchain: string = bloxTxProps.blockchain;
    const bloxTxData: IUbirchBlockchain = BlockchainSettings.blockchainSettings[blockchain];

    if (!bloxTxData) {
      return undefined;
    }

    const networkType: string = bloxTxProps.network_type;
    const blxExplorerUrl: string = this.getBlxExplorerUrl(bloxTxProps, bloxTxData);

    if (!blxExplorerUrl) {
      return undefined;
    }

    // add transactionId to url
    const titleStr: string = bloxTxProps.network_info
      ? bloxTxProps.network_info
      : bloxTxProps.blockchain;

    const ubirchBlockchainAnchor: IUbirchBlockchainAnchor = {
      txid: bloxTxProps.txid,
      networkInfo: bloxTxProps.network_info,
      networkType: networkType,
      blockchain: bloxTxProps.blockchain,
      timestamp: bloxTxProps.timestamp,
      iconUrl: bloxTxData.nodeIcon,
      blxTxExplorerUrl: blxExplorerUrl,
      label: titleStr,
    };

    return ubirchBlockchainAnchor;
  }

  protected sortObjectRecursive(object: unknown): unknown {
    // recursive termination condition
    if (typeof object !== 'object') {
      return object;
    } else if (Array.isArray(object)) {
      return object.map(item => this.sortObjectRecursive(item));
    } else {
      const objectSorted: { [key: string]: any } = {};
      const keysOrdered: { [key: string]: any } = Object.keys(object).sort();
      keysOrdered.forEach(
        (key: string) => (objectSorted[key] = this.sortObjectRecursive(object[key]))
      );

      return objectSorted;
    }
  }

  protected log(logInfo: UbirchMessage): void {
    this.messageSubject$.next(logInfo);
  }

  private getBlxExplorerUrl(bloxTxProps: IUbirchBlockchainAnchorProperties, bloxTxData: IUbirchBlockchain): string {

    if (!bloxTxProps.txid) {
      return undefined;
    }

    const networkType: string = bloxTxProps.network_type;
    const blxVersion: string = bloxTxProps.version;

    const explorerUrl = !blxVersion ? bloxTxData.explorerUrl[networkType] : this.getBlxExplorerUrlForVersion(bloxTxData, blxVersion, networkType);

    if (!explorerUrl || !explorerUrl.url) {
      return this.handleIncompleteBlockchainSettingsError();
    }

    return explorerUrl.url + bloxTxProps.txid;
  }

  protected getBlxExplorerUrlForVersion(bloxTxDataP: IUbirchBlockchain, blxVersion: string, networkType: string) {
    if (!bloxTxDataP.explorerUrl?.version) {
      return this.handleIncompleteBlockchainSettingsError();
    }
    const found: IUbirchBlockChainVersion[] = bloxTxDataP.explorerUrl?.version.filter(version => version.versionNum === blxVersion);
    if (found?.length < 1) {
      return this.handleIncompleteBlockchainSettingsError();
    }
    if (!found[0][networkType]) {
      return this.handleIncompleteBlockchainSettingsError();
    }
    return found[0][networkType]
  }

  private handleIncompleteBlockchainSettingsError() {
    this.handleInfo(EInfo.BLOCKCHAIN_SETTINGS_INCOMPLETE);
    return undefined;
  }

  private verifiedLangStr(key: string): string {
    const val = i18n.t(key);
    return val === key || 'default:' + val === key ? '' : val;
  }
}

window['UbirchVerification'] = UbirchVerification;
