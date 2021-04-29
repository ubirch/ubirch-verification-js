import { EError, EHashAlgorithms, EInfo, ELanguages, EStages, EUppStates, EVerificationState } from "./enums";

export interface IUbirchMessage {
  message: string;
  code: EError | EInfo | EVerificationState;
}

export interface IUbirchVerificationConfig {
  algorithm: EHashAlgorithms;
  accessToken: string;
  stage?: EStages;
  language?: ELanguages;
  debug?: boolean;
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
  verificationState: EVerificationState;
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
export type DataParams = { [index: string]: string };
