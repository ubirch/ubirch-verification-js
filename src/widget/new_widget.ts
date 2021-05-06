import i18n from 'i18next';
import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EVerificationState,
  UbirchMessage,
} from '../models/models';
import { initTranslations } from '../utils/translations';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import styles from './widget.module.scss';

initTranslations({ de, en });

export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
  messenger: Observable<UbirchMessage>;
}

type WidgetInfoTexts = Partial<
  {
    [key in EMessageType]: string;
  }
>;

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private openConsoleInSameTarget: boolean;
  private prevTexts: WidgetInfoTexts | null = null;

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
    this.host.innerHTML = '';
    this.host.innerHTML = `<div class="${styles.container}">
      <div class="${styles.container__row}">
        <div class="${styles.container__seal_output}">
          ${this.renderSealOutput(message)}
        </div>
        <div class="${styles.container__heading_box}">
          ${this.getHeadline(texts[EMessageType.VERIFICATION_STATE], headlineClassList)}
        </div>
      </div>
      <div class="${styles.container__row}">
        ${
          message.type === EMessageType.ERROR
            ? `<p class="${this.getClassName(styles.container__error_output, message)}">${
                texts[EMessageType.ERROR]
              }</p>`
            : ''
        }
        ${
          message.type === EMessageType.VERIFICATION_STATE
            ? `<p class="${this.getClassName(styles.container__result_output, message)}">${
                texts[EMessageType.VERIFICATION_STATE]
              }</p>`
            : ''
        }
      <div>
      </div>`;
    this.prevTexts = texts;
  }

  private renderSealOutput(message: UbirchMessage): string {
    if (message.type !== EMessageType.VERIFICATION_STATE) {
      return '';
    }
    const isSuccessful =
      message.result.verificationState === EVerificationState.VERIFICATION_SUCCESSFUL ||
      message.result.verificationState === EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL;

    const sealSuffix = isSuccessful ? 'seal' : 'no_seal';
    const iconSrcSuffix = BlockchainSettings.ubirchIcons[sealSuffix];
    const iconId = `ubirch-verification-${sealSuffix}-img`;
    return this.createIconString(`${environment.assets_url_prefix}${iconSrcSuffix}`, iconId);
  }

  private updateTexts(message: UbirchMessage) {
    return this.prevTexts !== null
      ? {
          ...this.prevTexts,
          [message.type]: i18n.t(`${message.type}.${message.code}`),
        }
      : { [message.type]: i18n.t(`${message.type}.${message.code}`) };
  }

  private getHeadline(headline: string, className: string): string {
    return headline === '' ? '' : ` <h4 class="${className}">${headline}</h4>`;
  }

  private getClassName(rootClassName: string, message: UbirchMessage): string {
    const classNames = classnames(rootClassName, {
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
    return classNames;
  }

  private createIconString(src: string, id: string): string {
    return `<img src="${src}" id="${id}" class="${styles.container__seal}" alt="seal icon" />`;
  }

  private deprecated__showSeal(successful: boolean, hash: string, noLink: boolean = false) {
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
}

window['UbirchVerificationWidget'] = UbirchVerificationWidget;
