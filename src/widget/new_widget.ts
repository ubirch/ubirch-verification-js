import {
  IUbirchVerificationResult,
} from '../models/types';
import {
  EError,
  ELanguages,
  EVerificationState
} from '../models/enums';
import { initTranslations } from '../utils/translations';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';
import i18next from 'i18next';

initTranslations({ en, de });

export enum WidgetClassNameSuffixes {
  InfoText = 'info-text',
  SealOutput = 'seal-output',
  ResultOutput = 'result-output',
  ErrorOutput = 'error-output',
}

export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
  initialVerificationResult?: IUbirchVerificationResult;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private verificationResult: IUbirchVerificationResult;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.update(config.initialVerificationResult);
  }

  public update(verificationResult?: IUbirchVerificationResult) {
    this.verificationResult = verificationResult;
    this.renderTemplate();
  }

  private renderTemplate(): void {
    this.host.insertAdjacentHTML(
      'beforeend',
      `<div class="ubirch-${WidgetClassNameSuffixes.InfoText}">${this.getHeadlineInfoText()}</div>
        <div class="ubirch-${WidgetClassNameSuffixes.SealOutput}"></div>
        <div class="ubirch-${WidgetClassNameSuffixes.ResultOutput}"></div>
        <div class="ubirch-${WidgetClassNameSuffixes.ErrorOutput}">${this.getErrorOutput()}</div>`
    );
  }

  private getErrorOutput(): string {
    if (this.verificationResult && this.verificationResult.verificationState === EVerificationState.VERIFICATION_FAILED) {
      return `<span class="ubirch-error-output">Error msg TBD</span>`;
    }
    return '';
  }

  private getHeadlineInfoText(): string {
    let classNames = 'ubirch-verification-info';
    let tKey = 'PENDING.info';
    if (this.verificationResult) {
      switch (this.verificationResult.verificationState) {
        case EVerificationState.VERIFICATION_SUCCESSFUL:
        case EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL:
          classNames = 'ubirch-verification-success ubirch-verification-headline';
          tKey = 'SUCCESS.headline';
          break;
        case EVerificationState.VERIFICATION_FAILED:
          classNames = 'ubirch-verification-fail';
          tKey = 'FAIL.info';
          break;
        case EVerificationState.VERIFICATION_PENDING:
        default:
          classNames = 'ubirch-verification-info';
          tKey = 'PENDING.info';
          break;
      }
    }
    return `<span class="${classNames}">${i18next.t(tKey)}</span>`;
  }
}
