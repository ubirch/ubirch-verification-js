import i18next from 'i18next';
import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EVerificationState,
  IUbirchBlockchain,
  IUbirchVerificationAnchorProperties,
  UbirchMessage,
} from '../models/models';
import { initTranslations } from '../utils/translations';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import styles from './widget.module.scss';

initTranslations({ en, de });
export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
  messenger: Observable<UbirchMessage>;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private openConsoleInSameTarget: boolean;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.openConsoleInSameTarget = config.openConsoleInSameTarget || false;
    config.messenger.subscribe((message) => {
      if (message) this.render(message);
    });
  }

  private render(message: UbirchMessage): void {
    const headlineClassList = this.getClassName(styles.container__verification_headline, message);
    this.host.innerHTML = `<div class="${styles.container}">
        <header class="${styles.container__row}">
          <h1 class="${headlineClassList}">
            ${this.getHeadlineText(message)}
          </h1>
        </header>
        <div class="${styles.container__row}">
          <div class="${styles.container__seal_output}"></div>
        <div>
        <div class="${styles.container__row}">
          <div class="${styles.container__result_output}"></div>
        </div>
        <div class="${styles.container__row}">
          ${this.getErrorOutput(message)}
        </div>
      </div>`;
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

  private getErrorOutput(message: UbirchMessage): string {
    if (
      message.type === EMessageType.ERROR ||
      (message.type === EMessageType.VERIFICATION_STATE &&
        message.result.verificationState === EVerificationState.VERIFICATION_FAILED)
    ) {
      return ` <p class="${styles.container__error_output}">${message.message}</p>`;
    }
    return '';
  }

  private getHeadlineText(message: UbirchMessage): string {
    switch (message.type) {
      case EMessageType.INFO:
      case EMessageType.ERROR:
        return message.message;
      case EMessageType.VERIFICATION_STATE:
        switch (message.result.verificationState) {
          case EVerificationState.VERIFICATION_FAILED:
            return i18next.t('FAIL.info');
          case EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL:
          case EVerificationState.VERIFICATION_SUCCESSFUL:
            return i18next.t('SUCCESS.headline');
          case EVerificationState.VERIFICATION_PENDING:
            return i18next.t('PENDING.info');
          default:
            return '';
        }
      default:
        return '';
    }
  }

  private showSeal(successful: boolean, hash: string, noLink: boolean = false) {
    const iconSrcSuffix: string = successful
      ? BlockchainSettings.ubirchIcons.seal
      : BlockchainSettings.ubirchIcons.no_seal;
    const iconId = `ubirch-verification-${successful ? 'seal' : 'no-seal'}-img`;
    const icon = this.createIconString(`${environment.assets_url_prefix}${iconSrcSuffix}`, iconId);

    if (noLink) {
      return icon;
    } else {
      const encodedHash: string = encodeURIComponent(hash);
      const href = `${environment.console_verify_url}?hash=${encodedHash}`;
      return `
        <a href="${href}" ${!this.openConsoleInSameTarget ? 'target="_blank' : ''}>
          ${icon}
        </a>
      `;
    }
  }

  private createIconString(src: string, id: string, width?: string, height?: string): string {
    return `<img src="${src}" id="${id}" style="width: ${width}; height: ${height}" />`;
  }
}
