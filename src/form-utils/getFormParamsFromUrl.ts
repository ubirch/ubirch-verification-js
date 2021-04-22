import i18n from 'i18next';
import { EError, IUbirchError } from '../models/models';

const allowedCharacters = Array.from(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%"
);

const log = (errorStr: IUbirchError): void => {
  console.log(JSON.stringify(errorStr));
};

const handleError = (
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

  log(err);
  throw err;
};

const sanitizeUrlAndQuery = (urlStr: string) => {
  const foundNotAllowedChars: string[] = [...Array.from(urlStr)].filter(
    (char) => !allowedCharacters.includes(char)
  );
  const uniqueFoundNotAllowedChars = foundNotAllowedChars.filter(
    (char, index) => foundNotAllowedChars.indexOf(char) === index
  );

  if (uniqueFoundNotAllowedChars.length > 0) {
    const errAttributes: any = {
      notAllowedChars: uniqueFoundNotAllowedChars,
    };
    handleError(EError.URL_PARAMS_CORRUPT, undefined, errAttributes);
  }

  return urlStr;
};

const handleFragment = (windowRef: Window): string => {
  let hash: string;
  try {
    hash = windowRef.location.hash;
  } catch (e) {
    handleError(EError.LOCATION_MALFORMED);
  }

  return hash ? sanitizeUrlAndQuery(hash.slice(1)) : undefined;
};

const handleQuery = (windowRef: Window): string => {
  let query: string;
  try {
    query = windowRef.location.search;
  } catch (e) {
    handleError(EError.LOCATION_MALFORMED);
  }

  return query.length > 0 ? sanitizeUrlAndQuery(query.substr(1)) : undefined;
};

const getFormParamsFromUrl = (windowRef: Window): string => {
  const hash = handleFragment(windowRef);

  return hash ? hash : handleQuery(windowRef);
};

export default getFormParamsFromUrl;
