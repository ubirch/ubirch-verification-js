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

  static parseParams = (params = ''): { [index: string]: string } => {
    return Object.fromEntries(params.split('&').map((pair) => pair.split('=', 2))) || {};
  };

  static getFormParamsFromUrl = (windowRef: Window): { [index: string]: string } => {
    return FormUtils.parseParams(
      FormUtils.handleFragment(windowRef) || FormUtils.handleQuery(windowRef)
    );
  };
}
