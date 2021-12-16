import { Observable } from 'rxjs';

export enum EUbirchHashAlgorithms {
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

export enum EUbirchLanguages {
  de = 'de',
  en = 'en',
}

export enum EUbirchStages {
  local = 'local',
  dev = 'dev',
  demo = 'demo',
  qa = 'qa',
  prod = 'prod',
}

export enum EUbirchVerificationStateKeys {
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  VERIFICATION_PARTLY_SUCCESSFUL = 'VERIFICATION_PARTLY_SUCCESSFUL',
  VERIFICATION_SUCCESSFUL = 'VERIFICATION_SUCCESSFUL',
}

export enum EUppStates {
  created = 'created',
  anchored = 'anchored',
}

export enum EInfo {
  URL_PARAMS_PARSED_SUCCESS = 'URL_PARAMS_PARSED_SUCCESS',
  URL_PARAMS_FORMFILL_SUCCESS = 'URL_PARAMS_FORMFILL_SUCCESS',
  START_VERIFICATION_CALL = 'START_VERIFICATION_CALL',
  START_CHECKING_RESPONSE = 'START_CHECKING_RESPONSE',
  UPP_HAS_BEEN_FOUND = 'UPP_HAS_BEEN_FOUND',
  WARNING_EMPTY_BLXTX_FOUND = 'WARNING_EMPTY_BLXTX_FOUND',
  BLXTX_FOUND_SUCCESS = 'BLXTX_FOUND_SUCCESS',
  RESPONSE_JSON_PARSED_SUCCESSFULY = 'RESPONSE_JSON_PARSED_SUCCESSFULY',
  NO_BLXTX_FOUND = 'NO_BLXTX_FOUND',
  BLXTXS_FOUND_SUCCESS = 'BLXTXS_FOUND_SUCCESS',
  VERIFICATION_SUCCESSFUL_INFO = 'VERIFICATION_SUCCESSFUL_INFO',
  SIGNATURE_VERIFICATION_SUCCESSFULLY = 'SIGNATURE_VERIFICATION_SUCCESSFULLY',
}

export enum EError {
  CERTIFICATE_ID_CANNOT_BE_FOUND = 'CERTIFICATE_ID_CANNOT_BE_FOUND',
  VERIFICATION_UNAVAILABLE = 'VERIFICATION_UNAVAILABLE',
  VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE = 'VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE',
  URL_PARAMS_CORRUPT = 'URL_PARAMS_CORRUPT',
  LOCATION_MALFORMED = 'LOCATION_MALFORMED',
  MANDATORY_FIELD_MISSING = 'MANDATORY_FIELD_MISSING',
  URL_PARAMS_FORMFILL_FAILED = 'URL_PARAMS_FORMFILL_FAILED',
  FILLING_FORM_WITH_PARAMS_FAILED = 'FILLING_FORM_WITH_PARAMS_FAILED',
  JSON_PARSE_FAILED = 'JSON_PARSE_FAILED',
  JSON_MALFORMED = 'JSON_MALFORMED',
  CANNOT_ACCESS_FORM_FIELD = 'CANNOT_ACCESS_FORM_FIELD',
  MISSING_PROPERTY_IN_UBRICH_VERIFICATION_INSTANCIATION = 'MISSING_PROPERTY_IN_UBRICH_VERIFICATION_INSTANCIATION',
  ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND = 'ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND',
  MISSING_PARAM_IDS = 'MISSING_PARAM_IDS',
  PARAM_ID_MAPPING_MISSMATCH = 'PARAM_ID_MAPPING_MISSMATCH',
  MISSING_ACCESS_TOKEN = 'MISSING_ACCESS_TOKEN',
  CERTIFICATE_DATA_MISSING = 'CERTIFICATE_DATA_MISSING',
  VERIFICATION_NOT_POSSIBLE = 'VERIFICATION_NOT_POSSIBLE',
  VERIFICATION_FAILED_CANNOT_DECODE_HWDEVICEID_FROM_UPP = 'VERIFICATION_FAILED_CANNOT_DECODE_HWDEVICEID_FROM_UPP',
  VERIFICATION_FAILED_DEVICE_PUBKEY_CANNOT_BE_VERIFIED = 'VERIFICATION_FAILED_DEVICE_PUBKEY_CANNOT_BE_VERIFIED',
  NO_ERROR = 'NO_ERROR',
  VERIFICATION_FAILED_EMPTY_RESPONSE = 'VERIFICATION_FAILED_EMPTY_RESPONSE',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED = 'VERIFICATION_FAILED_SIGNATURE_CANNOT_BE_VERIFIED',
  CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE = 'CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum EUbirchMessageTypes {
  INFO = 'info',
  ERROR = 'error',
  VERIFICATION_STATE = 'verification-state',
}

export interface IUbirchErrorDetails {
  errorMessage?: string;
  notAllowedChars?: string[];
}

export interface IUbirchInfo {
  type: EUbirchMessageTypes.INFO;
  message: string;
  code: EInfo;
}

export interface IUbirchError {
  type: EUbirchMessageTypes.ERROR;
  message: string;
  code: EError;
  errorDetails?: IUbirchErrorDetails;
}

export interface IUbirchVerificationState {
  type: EUbirchMessageTypes.VERIFICATION_STATE;
  message: string;
  code: EUbirchVerificationStateKeys;
  result?: IUbirchVerificationResult;
}

export type UbirchMessage = IUbirchInfo | IUbirchError | IUbirchVerificationState;

export interface IUbirchVerificationConfig {
  algorithm?: EUbirchHashAlgorithms;
  accessToken: string;
  stage?: EUbirchStages;
  language?: EUbirchLanguages;
}

export interface IUbirchVerificationWidgetConfig extends IUbirchVerificationConfig {
  hostSelector: string;
  openConsoleInSameTarget?: boolean;
  linkToConsole?: boolean;
}

export interface IUbirchFormUtils {
  readonly messenger: Observable<UbirchMessage>;
}

export interface IUbirchFormUtilsConfig {
  formIds: string[];
  paramsFormIdsMapping?: string[];
}

export interface IUbirchStagesURLs {
  local?: string;
  dev?: string;
  demo?: string;
  prod?: string;
}

export interface IUbirchVerificationEnvConfig {
  verify_api_url: IUbirchStagesURLs;
  verify_api_path: string;
  console_verify_url: IUbirchStagesURLs;
  console_verify_path: string;
  key_service_url: IUbirchStagesURLs;
  device_service_url: IUbirchStagesURLs;
  assets_url_prefix: string;
}

export interface IUbirchVerificationResponse {
  anchors: {
    upper_blockchains: IUbirchBlockchainAnchorRAW[];
  };
  prev: any; // @todo define type
  upp: string;
}

export interface IUbirchBlockchainAnchorRAW {
  label: string;
  properties: IUbirchBlockchainAnchorProperties;
}

export interface IUbirchBlockchainAnchorProperties {
  blockchain: string;
  created: string;
  hash: string;
  message: string;
  network_info: string;
  network_type: string;
  prev_hash: string;
  public_chain: string;
  status: string;
  timestamp: string;
  txid: string;
}

export interface IUbirchVerificationResult {
  hash: string;
  upp: IUbirchUpp;
  anchors: IUbirchBlockchainAnchor[];
  firstAnchorTimestamp: string | null;
  verificationState: EUbirchVerificationStateKeys;
  failReason?: EError;
}

export interface IUbirchUpp {
  upp: string;
  state: EUppStates;
}

export interface IUbirchBlockchainAnchor {
  raw: IUbirchBlockchainAnchorProperties;
  txid: string;
  networkInfo: string;
  networkType: string;
  timestamp: string;
  iconUrl: string;
  blxTxExplorerUrl: string;
  label: string;
}

export interface IUbirchBlockchain {
  nodeIcon: string;
  explorerUrl: IUbirchBlockhainTransidCheckUrl;
}

export interface IUbirchBlockhainTransidCheckUrl {
  bdr?: IUbirchBlockchainNet;
  testnet?: IUbirchBlockchainNet;
  mainnet?: IUbirchBlockchainNet;
}

export interface IUbirchBlockchainNet {
  url: string;
}

export interface IUbirchVerificationAnchorProperties {
  blockchain: string;
  created: string;
  hash: string;
  message: string;
  network_info: string;
  network_type: string;
  prev_hash: string;
  public_chaing: string;
  status: string;
  timestamp: string;
  txid: string;
}

export type TUbirchDataParams = { [ index: string ]: string | string[] };
