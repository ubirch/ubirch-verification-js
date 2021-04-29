import {
  EError,
  ELanguages,
  EVerificationState,
  IUbirchVerificationResult,
} from '../models/models';
import { initTranslations } from '../utils/translations';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';
import i18next from 'i18next';
import styles from './widget.module.scss';

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
    this.host.innerHTML = '';
    this.host.insertAdjacentHTML(
      'beforeend',
      `<div class="${styles['ubirch-info-text']}">${this.getHeadlineInfoText()}</div>
        <div class="${styles['ubirch-seal-output']}"></div>
        <div class="${styles['ubirch-result-output']}"></div>
        <div class="${styles['ubirch-error-output']}">${this.getErrorOutput()}</div>`
    );
  }

  private getErrorOutput(): string {
    if (
      this.verificationResult &&
      this.verificationResult.verificationState === EVerificationState.VERIFICATION_FAILED
    ) {
      return `<span class="${styles['ubirch-error-output']}">Error msg TBD</span>`;
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
          classNames = `${styles['ubirch-verification-success']} ${styles['ubirch-verification-headline']}`;
          tKey = 'SUCCESS.headline';
          break;
        case EVerificationState.VERIFICATION_FAILED:
          classNames = styles['ubirch-verification-fail'];
          tKey = 'FAIL.info';
          break;
        case EVerificationState.VERIFICATION_PENDING:
        default:
          classNames = styles['ubirch-verification-info'];
          tKey = 'PENDING.info';
          break;
      }
    }
    return `<span class="${classNames}">${i18next.t(tKey)}</span>`;
  }
}
