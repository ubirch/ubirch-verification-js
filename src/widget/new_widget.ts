import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EVerificationState,
  IUbirchVerificationResult,
  UbirchMessage,
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
  messenger: Observable<UbirchMessage>;
  initialVerificationResult?: IUbirchVerificationResult;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private verificationResult: IUbirchVerificationResult;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    config.messenger.subscribe(this.render);
  }

  private render(message: UbirchMessage): void {
    this.host.innerHTML = '';
    const headlineClassList = this.getClassName(styles.container__verification_headline, message);
    this.host.insertAdjacentHTML(
      'beforeend',
      `<div class="${styles.container}">
        <header class="${styles.container__row}">
          <h1 class="${headlineClassList}">${message.message}</h1>
        </header>
        <div class="${styles.container__row}">
          <div class="${styles.container__seal_output}"></div>
        <div>
        <div class="${styles.container__row}">
          <div class="${styles.container__result_output}"></div>
        </div>
        <div class="${styles.container__row}">
          <p class="${styles.container__error_output}"></p>
        </div>
      </div>`
    );
  }

  private getClassName(rootClassName: string, message: UbirchMessage): string {
    return classnames(rootClassName, {
      [styles.container__verification_info]:
        message.type === EMessageType.INFO ||
        (message.type === EMessageType.VERIFICATION_STATE &&
          message.result?.verificationState === EVerificationState.VERIFICATION_PENDING),
      [styles.container__verification_success]:
        message.type === EMessageType.VERIFICATION_STATE &&
        message.result?.verificationState === EVerificationState.VERIFICATION_SUCCESSFUL,
      [styles.container__verification_fail]:
        message.type === EMessageType.ERROR ||
        (message.type === EMessageType.VERIFICATION_STATE &&
          message.result?.verificationState === EVerificationState.VERIFICATION_FAILED),
    });
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

  private getHeadlineInfoText(type: EMessageType, msg: string): string {
    let classNames = styles['ubirch-verification-info'];
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
