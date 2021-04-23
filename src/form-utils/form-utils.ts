import i18n from 'i18next';
import { EError, IUbirchError } from '../models/models';

export class FormUtils {
  static allowedCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%";

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

  static parseParams = (params:string): { [index: string]: string } => {
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
   * @param dataP string that contains field params in a form like:
   *    pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1&tid=FGXC-CL11-KDKC-P9XC-74MM&td=2020-06-12&tt=11:00:00&tr=negativ
   * @param documentRef Reference to document
   */
  // public setDataIntoForm(params = {}, documentRef) {
  //   try {
  //     const separator = separatorP || '&';
  //     const arraySeparator = arraySeparatorP || ',';

  //     const allParams = dataP.split(separator).map((dataset: string) => {
  //       const data = dataset.split('=');

  //       return {
  //         key: data[0],
  //         value: this.handleUrlParamValue(data[1], arraySeparator),
  //       };
  //     });

  //     allParams.forEach((param) => {
  //       if (param.key) {
  //         let key = param.key;
  //         if (this.paramsFormIdsMapping && this.paramsFormIdsMapping.length > 0) {
  //           const idIndex = this.paramsFormIdsMapping.indexOf(key);
  //           if (idIndex < 0) {
  //             console.warn('No mapping defined for ' + key);
  //           } else {
  //             key = this.formIds[idIndex];
  //           }
  //         }
  //         if (Array.isArray(param.value)) {
  //           param.value.forEach((value, index) => {
  //             const keyStr = `${key}_${index}`;
  //             if (
  //               documentRef.getElementById(keyStr) &&
  //               documentRef.getElementById(keyStr) !== null
  //             ) {
  //               documentRef.getElementById(keyStr).value = value;
  //             }
  //           });
  //         } else {
  //           if (documentRef.getElementById(key) && documentRef.getElementById(key) !== null) {
  //             documentRef.getElementById(key).value = param.value;
  //           }
  //         }
  //       }
  //     });
  //   } catch (e) {
  //     const err: IUbirchFormError = {
  //       message: e.message,
  //       code: EError.FILLING_FORM_WITH_PARAMS_FAILED,
  //     };
  //     throw err;
  //   }
  // }
}
