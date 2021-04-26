import i18n from 'i18next';
import { EError, IUbirchError, IUbirchFormVerificationConfig } from '../models/models';

const DEFAULT_FORM_CONFIG: IUbirchFormVerificationConfig = {
  formIds: ['created', 'name', 'workshop'],
};

export class FormUtils {
  static allowedCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%";
  private formIds: string[];
  private paramsFormIdsMapping: string[];

  constructor(config: IUbirchFormVerificationConfig = DEFAULT_FORM_CONFIG) {
    if (!config.formIds) {
      throw new Error('Please, provide a string array with param ids');
    }
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

  static log = (errorStr: IUbirchError): void => {
    console.log(JSON.stringify(errorStr));
  };

  static handleError = (
    errorCode: EError,
    hash?: string,
    additionalErrorAttributes: any = {}
  ): void => {
    const errorMsg: string = i18n.t(errorCode);

    const err: IUbirchError = {
      message: errorMsg,
      code: errorCode,
      ...additionalErrorAttributes,
    };

    FormUtils.log(err);
    throw err;
  };

  static sanitizeUrlAndQuery = (urlStr: string): string => {
    const foundNotAllowedChars: string[] = [...Array.from(urlStr)].filter(
      (char) => !FormUtils.allowedCharacters.includes(char)
    );
    const uniqueFoundNotAllowedChars = foundNotAllowedChars.filter(
      (char, index) => foundNotAllowedChars.indexOf(char) === index
    );

    if (uniqueFoundNotAllowedChars.length > 0) {
      const errAttributes: any = {
        notAllowedChars: uniqueFoundNotAllowedChars,
      };
      FormUtils.handleError(EError.URL_PARAMS_CORRUPT, undefined, errAttributes);
    }

    return urlStr;
  };

  static handleFragment = (windowRef: Window): string => {
    let hash: string;
    try {
      hash = windowRef.location.hash;
    } catch (e) {
      FormUtils.handleError(EError.LOCATION_MALFORMED);
    }

    return hash ? FormUtils.sanitizeUrlAndQuery(hash.slice(1)) : undefined;
  };

  static handleQuery = (windowRef: Window): string => {
    let query: string;
    try {
      query = windowRef.location.search;
    } catch (e) {
      FormUtils.handleError(EError.LOCATION_MALFORMED);
    }

    return query.length > 0 ? FormUtils.sanitizeUrlAndQuery(query.substr(1)) : undefined;
  };

  private static handleUrlParamValue(val, arraySeparator: string): any {
    try {
      if (val.includes(arraySeparator)) {
        const arrayVal = val.split(arraySeparator).map(decodeURIComponent);
        return arrayVal;
      } else {
        return decodeURIComponent(val);
      }
    } catch (e) {
      FormUtils.handleError(EError.URL_PARAMS_CORRUPT);
    }
  }

  static parseParams = (params: string): { [index: string]: string } => {
    const splitDataset = (dataset: string) => {
      const arraySeparator = ',';

      const data = dataset.split('=');

      return [data[0], FormUtils.handleUrlParamValue(data[1], arraySeparator)];
    };

    if (!params) return {};

    return Object.fromEntries(params.split('&').map(splitDataset)) || {};
  };

  /**
   * get params of form fields as string from fragment OR - if no fragment set - from query of url
   * @param windowRef Reference to window
   */
  static getFormParamsFromUrl = (windowRef: Window): { [index: string]: string } => {
    return FormUtils.parseParams(
      FormUtils.handleFragment(windowRef) || FormUtils.handleQuery(windowRef)
    );
  };

  /**
   * put params into form fields
   * @param params object that contains field params
   * @param documentRef Reference to document
   */
  public setDataIntoForm(params: { [index: string]: string } = {}, documentRef: Document): void {
    try {
      Object.entries(params).forEach(([key, value]) => {
        if (key) {
          if (this.paramsFormIdsMapping && this.paramsFormIdsMapping.length > 0) {
            const idIndex = this.paramsFormIdsMapping.indexOf(key);
            if (idIndex < 0) {
              console.warn('No mapping defined for ' + key);
            } else {
              key = this.formIds[idIndex];
            }
          }
          if (Array.isArray(value)) {
            value.forEach((value, index) => {
              const keyStr = `${key}_${index}`;
              const element = documentRef.getElementById(keyStr);
              if (element) (element as HTMLInputElement).value = value;
            });
          } else {
            const element = documentRef.getElementById(key);
            if (element) (element as HTMLInputElement).value = value;
          }
        }
      });
    } catch (e) {
      const err: IUbirchError = {
        message: e.message,
        code: EError.FILLING_FORM_WITH_PARAMS_FAILED,
      };
      throw err;
    }
  }
}
