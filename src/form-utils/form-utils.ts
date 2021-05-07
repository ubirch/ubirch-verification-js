import i18n from 'i18next';
import {
  EError,
  EMessageType,
  IUbirchFormUtilsConfig,
  IUbirchError,
  IUbirchErrorDetails,
  UbirchMessage,
  DataParams,
} from '../models/models';
import { messageSubject$ } from '../messenger';

const DEFAULT_CONFIG: IUbirchFormUtilsConfig = {
  formIds: [],
};

export class UbirchFormUtils {
  static readonly allowedCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%";
  private formIds: string[];
  private paramsFormIdsMapping: string[];

  constructor(config: IUbirchFormUtilsConfig = DEFAULT_CONFIG) {
    this.formIds = config.formIds;
    if (config.paramsFormIdsMapping) {
      if (config.paramsFormIdsMapping.length !== this.formIds.length) {
        throw new Error(
          'If you provide paramsFormIdsMapping define a mapping for each formId; they need to be in the same order'
        );
      }
      this.paramsFormIdsMapping = config.paramsFormIdsMapping;
    }
  }

  static log(logInfo: UbirchMessage): void {
    messageSubject$.next(logInfo);
  }

  static handleError = (code: EError, errorDetails?: IUbirchErrorDetails): void => {
    const errorMsg: string = i18n.t(code);

    const err: IUbirchError = {
      type: EMessageType.ERROR,
      message: errorMsg,
      code,
      errorDetails,
    };

    UbirchFormUtils.log(err);
    throw err;
  };

  static sanitizeUrlAndQuery = (urlStr: string): string => {
    const foundNotAllowedChars: string[] = [...Array.from(urlStr)].filter(
      (char) => !UbirchFormUtils.allowedCharacters.includes(char)
    );

    const uniqueFoundNotAllowedChars = foundNotAllowedChars.filter(
      (char, index) => foundNotAllowedChars.indexOf(char) === index
    );

    if (uniqueFoundNotAllowedChars.length > 0) {
      const errorDetails: IUbirchErrorDetails = {
        notAllowedChars: uniqueFoundNotAllowedChars,
      };
      UbirchFormUtils.handleError(EError.URL_PARAMS_CORRUPT, errorDetails);
    }

    return urlStr;
  };

  static handleFragment = (windowRef: Window): string | undefined => {
    let hash: string;
    try {
      hash = windowRef.location.hash || windowRef.location.search;
    } catch (e) {
      UbirchFormUtils.handleError(EError.LOCATION_MALFORMED);
    }

    return hash ? UbirchFormUtils.sanitizeUrlAndQuery(hash.slice(1)) : undefined;
  };

  private static handleUrlParamValue(val: string, arraySeparator: string): string[] | string {
    try {
      if (val.includes(arraySeparator)) {
        const arrayVal = val.split(arraySeparator).map(decodeURIComponent);
        return arrayVal;
      } else {
        return decodeURIComponent(val);
      }
    } catch (e) {
      UbirchFormUtils.handleError(EError.URL_PARAMS_CORRUPT, { errorMessage: e.message });
    }
  }

  static parseParams = (paramsString: string, separator: string): DataParams => {
    const splitDataset = (dataset: string) => {
      const arraySeparator = ',';

      const data = dataset.split('=');

      return [data[0], UbirchFormUtils.handleUrlParamValue(data[1], arraySeparator)];
    };

    if (!paramsString) return {};

    return Object.fromEntries(paramsString.split(separator).map(splitDataset));
  };

  /**
   * get params of form hash or search part of url
   * @param windowRef Reference to window
   * @param separator data separator string
   */
  public getFormParamsFromUrl = (windowRef: Window, separator: string): DataParams =>
    UbirchFormUtils.parseParams(UbirchFormUtils.handleFragment(windowRef), separator);

  /**
   * put params into form fields
   * @param params object that contains field params
   * @param documentRef Reference to document
   */
  public setDataIntoForm(params: DataParams, documentRef: Document): void {
    try {
      Object.entries(params).forEach(([key, value]) => {
        if (this.paramsFormIdsMapping && this.paramsFormIdsMapping.length > 0) {
          const idIndex = this.paramsFormIdsMapping.indexOf(key);
          if (idIndex < 0) {
            console.warn('No mapping defined for ' + key);
          } else {
            key = this.formIds[idIndex];
          }
        }
        if (Array.isArray(value)) {
          value.forEach((valueItem, index) => {
            const keyStr = `${key}_${index}`;
            const element = documentRef.getElementById(keyStr);
            if (element && element.tagName === 'INPUT') {
              (element as HTMLInputElement).value = valueItem;
            }
          });
        } else {
          const element = documentRef.getElementById(key);
          if (element && element.tagName === 'INPUT') {
            (element as HTMLInputElement).value = value;
          }
        }
      });
    } catch (e) {
      UbirchFormUtils.handleError(EError.FILLING_FORM_WITH_PARAMS_FAILED, {
        errorMessage: e.message as string,
      });
    }
  }
}

window['UbirchFormUtils'] = UbirchFormUtils;
