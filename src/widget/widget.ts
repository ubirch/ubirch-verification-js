import { Observable } from 'rxjs';
import classnames from 'classnames';
import {
  EError,
  ELanguages,
  EMessageType,
  EStages,
  EVerificationState,
  IUbirchBlockchainAnchor,
  UbirchMessage,
} from '../models/models';
import environment from '../environment';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import i18n from '../utils/translations';
import styles from './widget.module.scss';

export interface IUbirchVerificationWidgetConfig {
  hostSelector: string;
  openConsoleInSameTarget?: boolean;
  messenger: Observable<UbirchMessage>;
  language?: ELanguages;
  linkToConsole?: boolean;
  stage?: EStages;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private linkToConsole: boolean = false;
  private openConsoleInSameTarget: boolean;
  private headlineText: string = '';
  private resultText: string = '';
  private blockchainIconsAnchors: string = '';
  private stage: EStages = EStages.dev;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host)
      throw new Error(i18n.t(`default:error.${EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND}`));
    this.host = host as HTMLElement;
    if (typeof config.linkToConsole === 'boolean') this.linkToConsole = config.linkToConsole;
    if (typeof config.openConsoleInSameTarget === 'boolean')
      this.linkToConsole = config.openConsoleInSameTarget;
    if (config.language) this.setLanguage(config.language);
    if (config.stage) this.stage = config.stage;
    config.messenger.subscribe((message) => {
      if (message) {
        this.updateHeadlineText(message);
        this.updateResultText(message);
        this.updateBlockchainAnchors(message);
        this.render(message);
      }
    });
  }

  public setLanguage(language: ELanguages): void {
    i18n.changeLanguage(language);
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
        <p class="${this.getClassName(
          styles.container__result_output,
          message
        )}" id="ubirch-verification-widget-result-text">
          ${this.resultText}
        </p>
      </div>
      <div class="${styles.container__row}" id="ubirch-verification-anchor-icons">
        ${this.blockchainIconsAnchors}
      </div>
    </div>`;
  }

  private updateHeadlineText(message: UbirchMessage): void {
    let suffix: string;
    if (message.type === EMessageType.ERROR) suffix = EVerificationState.VERIFICATION_FAILED;
    else if (message.type === EMessageType.VERIFICATION_STATE)
      suffix = message.result.verificationState;
    else suffix = EVerificationState.VERIFICATION_PENDING;
    this.headlineText = i18n.t(`default:${EMessageType.VERIFICATION_STATE}.${suffix}`);
  }

  private updateResultText(message: UbirchMessage): void {
    if (message.type !== EMessageType.VERIFICATION_STATE) {
      this.resultText =
        message.code === EError.VERIFICATION_UNAVAILABLE
          ? i18n.t(`default:${message.type}.${message.code}`, {
              message: message.errorDetails.errorMessage,
            })
          : i18n.t(`default:${message.type}.${message.code}`);
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
    const iconString = this.createIconString(
      `${environment.assets_url_prefix}${iconSrcSuffix}`,
      iconId
    );
    let output: string;
    if (message.type === EMessageType.VERIFICATION_STATE && this.linkToConsole) {
      const encodedHash: string = encodeURIComponent(message.result?.hash);
      const href = `${environment.console_verify_url[this.stage]}?hash=${encodedHash}`;
      output = `<a href="${href}" ${!this.openConsoleInSameTarget ? 'target="_blank"' : ''}>
          ${iconString}
        </a>`;
    } else {
      output = iconString;
    }
    return `
      <div class="${styles.container__seal_output}">
        ${output}
      </div>`;
  }

  private updateBlockchainAnchors(message: UbirchMessage): void {
    if (message.type === EMessageType.VERIFICATION_STATE) {
      this.blockchainIconsAnchors = message.result.anchors
        .map((anchor: IUbirchBlockchainAnchor, index: number) => {
          const { raw } = anchor;
          const { blockchain, network_type } = raw;
          const blox = BlockchainSettings.blockchainSettings[blockchain] || undefined;
          if (!blox || !raw.txid) {
            return '';
          }

          const { url } = blox.explorerUrl[network_type];
          const iconId = `blockchain_transid_check${index === undefined ? '' : '_' + index}`;
          const titleString = raw.network_info ? raw.network_info : raw.blockchain;
          return `
            <a href="${url}${raw.txid}" title="${titleString}" target="_blank">
              ${
                blox?.nodeIcon
                  ? this.createIconString(environment.assets_url_prefix + blox?.nodeIcon, iconId)
                  : titleString
              }
            </a>
          `;
        })
        .join(' ');
    }
  }

  private getHeadline(headline: string, className: string): string {
    return headline === ''
      ? ''
      : ` <h3 class="${className}" id="ubirch-verification-widget-headline">${headline}</h3>`;
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
}

window['UbirchVerificationWidget'] = UbirchVerificationWidget;
