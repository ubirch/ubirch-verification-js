import { BehaviorSubject, Observable } from 'rxjs';
import {
  EError,
  EMessageType,
  IUbirchFormUtilsConfig,
  IUbirchError,
  IUbirchErrorDetails,
  UbirchMessage,
  DataParams,
  EInfo,
  IUbirchInfo,
  IUbirchFormUtils
} from '../models/models';
import i18n from '../utils/translations';

const DEFAULT_CONFIG: IUbirchFormUtilsConfig = {
  formIds: [],
};

export class UbirchFormUtils implements IUbirchFormUtils {
  static readonly allowedCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%";
  private formIds: string[];
  private paramsFormIdsMapping: string[];

  protected messageSubject$: BehaviorSubject<UbirchMessage> = new BehaviorSubject<UbirchMessage>(null);
  private messenger$: Observable<UbirchMessage> = this.messageSubject$.asObservable();

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

  public get messenger(): Observable<UbirchMessage> {
    return this.messenger$;
  }

  /**
   * get params of form hash or search part of url
   * @param windowRef Reference to window
   * @param separator data separator string
   */
  public getFormParamsFromUrl = (windowRef: Window, separator: string): DataParams => {
    const param: DataParams = this.parseParams(this.handleFragment(windowRef), separator);
    this.handleInfo(EInfo.URL_PARAMS_PARSED_SUCCESS);
    return param;
  }

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
      this.handleInfo(EInfo.URL_PARAMS_FORMFILL_SUCCESS);
    } catch (e) {
      this.handleError(EError.URL_PARAMS_FORMFILL_FAILED, {
        errorMessage: e.message as string,
      });
    }
  }

  private log(logInfo: UbirchMessage): void {
    this.messageSubject$.next(logInfo);
  }

  private handleInfo(code: EInfo): void {
    const infoMsg: string = i18n.t(`default:info.${code}`);

    const info: IUbirchInfo = {
      type: EMessageType.INFO,
      message: infoMsg,
      code,
    };

    this.log(info);
  }

  private handleError = (code: EError, errorDetails?: IUbirchErrorDetails): void => {
    const errorMsg: string = i18n.t(`default:error.${code}`);

    const err: IUbirchError = {
      type: EMessageType.ERROR,
      message: errorMsg,
      code,
      errorDetails,
    };

    this.log(err);
    throw err;
  };

  private sanitizeUrlAndQuery = (urlStr: string): string => {
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
      this.handleError(EError.URL_PARAMS_CORRUPT, errorDetails);
    }

    return urlStr;
  };

  private handleFragment = (windowRef: Window): string | undefined => {
    let hash: string;
    try {
      hash = windowRef.location.hash || windowRef.location.search;
    } catch (e) {
      this.handleError(EError.LOCATION_MALFORMED);
    }

    return hash ? this.sanitizeUrlAndQuery(hash.slice(1)) : undefined;
  };

  private handleUrlParamValue(val: string, arraySeparator: string): string[] | string {
    try {
      if (val.includes(arraySeparator)) {
        const arrayVal = val.split(arraySeparator).map(decodeURIComponent);
        return arrayVal;
      } else {
        return decodeURIComponent(val);
      }
    } catch (e) {
      this.handleError(EError.URL_PARAMS_CORRUPT, { errorMessage: e.message });
    }
  }

  private parseParams = (paramsString: string, separator: string): DataParams => {
    const splitDataset = (dataset: string) => {
      const arraySeparator = ',';

      const data = dataset.split('=');

      return [data[0], this.handleUrlParamValue(data[1], arraySeparator)];
    };

    if (!paramsString) return {};

    return Object.fromEntries(paramsString.split(separator).map(splitDataset));
  };

}

window['UbirchFormUtils'] = UbirchFormUtils;
