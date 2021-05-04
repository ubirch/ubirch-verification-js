import i18next from 'i18next';
import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EVerificationState,
  IUbirchError,
  UbirchMessage,
} from '../models/models';
import { initTranslations } from '../utils/translations';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import styles from './widget.module.scss';

initTranslations({
  en,
  de,
});

export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
  messenger: Observable<UbirchMessage>;
}

interface WidgetInfoTexts {
  headline: string;
  result: string;
  error: string;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private openConsoleInSameTarget: boolean;
  private prevTexts: WidgetInfoTexts = {
    headline: '',
    result: '',
    error: '',
  };

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
    const texts = this.updateTexts(message);
    const headlineClassList = this.getClassName(styles.container__verification_headline, message);
    this.host.innerHTML = `<div class="${styles.container}">
        <header class="${styles.container__row}">
          ${this.getHeadline(texts.headline, headlineClassList)}
        </header>
        <div class="${styles.container__row}">
          <div class="${styles.container__seal_output}"></div>
        <div>
        <div class="${styles.container__row}">
          <div class="${styles.container__result_output}">
            ${texts.result}
          </div>
        </div>
        <div class="${styles.container__row}">
          ${this.getErrorOutput(texts.error)}
        </div>
      </div>`;
    this.prevTexts = texts;
  }

  private updateTexts(message: UbirchMessage) {
    return {
      ...this.prevTexts,
      [message.type]: i18next.t(`${message.type}.${message.code}`),
    };
  }

  private getHeadline(headline: string, className: string): string {
    return headline === '' ? '' : ` <h1 class="${className}">${headline}</h1?`;
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

  private getErrorOutput(error: string): string {
    return error === ''
      ? ''
      : `<p class="${styles.container__error_output}">${error}</p>`;
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
    return `<img src="${src}" id="${id}" ${
      width && height ? `style="width: ${width}; height: ${height}"` : ''
    } />`;
  }
}
