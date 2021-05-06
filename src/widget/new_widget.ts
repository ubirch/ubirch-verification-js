import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EVerificationState,
  UbirchMessage,
} from '../models/models';
import environment from '../environment';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import i18n from '../utils/translations';
import styles from './widget.module.scss';

export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
  messenger: Observable<UbirchMessage>;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private openConsoleInSameTarget: boolean;
  private headlineText: string = '';
  private resultText: string = '';

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.openConsoleInSameTarget = config.openConsoleInSameTarget || false;
    config.messenger.subscribe((message) => {
      if (message) {
        this.updateHeadlineText(message);
        this.updateResultText(message);
        this.render(message);
      }
    });
  }

  private render(message: UbirchMessage): void {
    const headlineClassList = this.getClassName(styles.container__verification_headline, message);
    const noIconRow = message.type !== EMessageType.VERIFICATION_STATE;
    this.host.innerHTML = `<div class="${styles.container}">
      <div class="${styles.container__row}">
        ${this.renderSealOutput(message)}
        <div class="${classnames(styles.container__heading_box, {
          [styles['container__heading_box--wide']]: noIconRow,
        })}">
          ${this.getHeadline(this.headlineText, headlineClassList)}
        </div>
      </div>
      <div class="${styles.container__row}">
        <p class="${this.getClassName(styles.container__result_output, message)}">
          ${this.resultText}
        </p>
      <div>
      </div>`;
  }

  private updateHeadlineText(message: UbirchMessage): void {
    let suffix: string;
    if (message.type === EMessageType.ERROR) suffix = 'VERIFICATION_FAILED';
    else if (message.type === EMessageType.VERIFICATION_STATE)
      suffix = message.result.verificationState;
    else suffix = 'VERIFICATION_PENDING';
    this.headlineText = i18n.t(`widget:${EMessageType.VERIFICATION_STATE}.${suffix}`);
  }

  private updateResultText(message: UbirchMessage): void {
    if (message.type !== EMessageType.VERIFICATION_STATE) {
      this.resultText = i18n.t(`widget:${message.type}.${message.code}`);
    }
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
    return `
      <div class="${styles.container__seal_output}">
        ${this.createIconString(`${environment.assets_url_prefix}${iconSrcSuffix}`, iconId)}
      </div>`;
  }

  private getHeadline(headline: string, className: string): string {
    return headline === '' ? '' : ` <h3 class="${className}">${headline}</h3>`;
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
      [styles.container__verification_part_success]:
        message.type === EMessageType.VERIFICATION_STATE &&
        message.result?.verificationState === EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL,
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
