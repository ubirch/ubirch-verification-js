import i18next from 'i18next';
import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import {
  EError,
  ELanguages,
  IUbirchBlockchain,
  IUbirchBlockchainNet,
  IUbirchVerificationAnchorProperties,
  IUbirchVerificationResult,
} from '../models/models';
import { initTranslation } from '../utils/i18n';
import environment from '../environment';

export enum WidgetClassNameSuffixes {
  InfoText = 'info-text',
  SealOutput = 'seal-output',
  ResultOutput = 'result-output',
  ErrorOutput = 'error-output',
}

export interface IUbirchVerificationWidgetConfig {
  elementSelector: string;
  language?: ELanguages;
  openConsoleInSameTarget?: boolean;
}

initTranslation({ de, en });

export class $UbirchVerificationWidget {
  private host: HTMLElement;
  private sealInfoText: HTMLElement;
  private sealOutput: HTMLElement;
  private resultOutput: HTMLElement;
  private errorOutput: HTMLElement;
  public verificationResult: IUbirchVerificationResult | null;

  constructor(
    private hostSelector: string,
    initialVerificationResult?: IUbirchVerificationResult,
    public openConsoleInSameTarget?: boolean
  ) {
    const host = document.querySelector(this.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.verificationResult = initialVerificationResult || null;
    this.host = host as HTMLElement;
    this.display();
  }

  private display(): void {
    this.host.insertAdjacentHTML('beforeend', this.template);
    this.sealOutput = this.host.querySelector('.ubirch');
    this.sealInfoText = this.host.querySelector(WidgetClassNameSuffixes.InfoText);
    this.sealOutput = this.host.querySelector(WidgetClassNameSuffixes.SealOutput);
    this.resultOutput = this.host.querySelector(WidgetClassNameSuffixes.ResultOutput);
    this.errorOutput = this.host.querySelector(WidgetClassNameSuffixes.ErrorOutput);
    if (this.verificationResult) {
      
    }
  }

  private get template(): string {
    return Object.values(WidgetClassNameSuffixes).reduce((template: string, val: string) => {
      template += `<div class="ubirch-${val}"></div>`;
      return template;
    }, '');
  }
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private sealInfoText: HTMLElement;
  private sealOutput: HTMLElement;
  private resultOutput: HTMLElement;
  private errorOutput: HTMLElement;
  public highlightPageAfterVerification: boolean = false;
  public openConsoleInSameTarget: boolean;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.elementSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.openConsoleInSameTarget = config.openConsoleInSameTarget || false;
    this.host = host as HTMLElement;
    this.host.insertAdjacentHTML('beforeend', this.template);
    this.sealOutput = this.host.querySelector('.ubirch');
    this.sealInfoText = this.host.querySelector(WidgetClassNameSuffixes.InfoText);
    this.sealOutput = this.host.querySelector(WidgetClassNameSuffixes.SealOutput);
    this.resultOutput = this.host.querySelector(WidgetClassNameSuffixes.ResultOutput);
    this.errorOutput = this.host.querySelector(WidgetClassNameSuffixes.ErrorOutput);
  }

  public cleanupIcons(): void {
    // remove seal and transaction_check icons IF exist
    this.cleanAllChilds(this.resultOutput);
    this.cleanAllChilds(this.sealOutput);
    this.cleanAllChilds(this.sealInfoText);
  }

  public showSeal(successful: boolean, hash: string, nolink: boolean = false): void {
    let icon: HTMLElement;

    if (successful) {
      icon = this.createIconTag(
        environment.assets_url_prefix + BlockchainSettings.ubirchIcons.seal,
        'ubirch-verification-seal-img'
      );
    } else {
      icon = this.createIconTag(
        environment.assets_url_prefix + BlockchainSettings.ubirchIcons.no_seal,
        'ubirch-verification-no-seal-img'
      );
    }

    if (nolink) {
      this.sealOutput.appendChild(icon);
    } else {
      const link: HTMLElement = document.createElement('a');

      const encodedHash: string = encodeURIComponent(hash);

      link.setAttribute('href', `${environment.console_verify_url}?hash=${encodedHash}`);
      if (!this.openConsoleInSameTarget) {
        link.setAttribute('target', '_blank');
      }

      link.appendChild(icon);

      this.sealOutput.appendChild(link);
    }
  }

  public showSuccess(): void {
    this.resultOutput.innerHTML = '';
    this.errorOutput.innerHTML = '';

    this.resultOutput.appendChild(document.createElement('br'));
    this.resultOutput.appendChild(
      this.createTxtTag(i18next.t('SUCCESS.info'), 'ubirch-verification-success')
    );
    this.resultOutput.appendChild(document.createElement('br'));
  }

  public showBloxTXIcon(bloxTX: IUbirchVerificationAnchorProperties, index: number): void {
    if (!bloxTX) {
      return;
    }

    const blockchain: string = bloxTX.blockchain;
    const networkType: string = bloxTX.network_type;

    if (!blockchain || !networkType) {
      return;
    }

    const blox: IUbirchBlockchain = BlockchainSettings.blockchainSettings
      ? BlockchainSettings.blockchainSettings[blockchain]
      : undefined;

    if (!blox || !bloxTX.txid) {
      return;
    }

    const bloxTXData: IUbirchBlockchainNet = blox.explorerUrl[networkType];

    const linkTag: HTMLElement = document.createElement('a');

    // add transactionId to url
    if (bloxTXData.url) {
      linkTag.setAttribute('href', bloxTXData.url + bloxTX.txid);
    }

    const titleStr: string = bloxTX.network_info ? bloxTX.network_info : bloxTX.blockchain;

    linkTag.setAttribute('title', titleStr);
    linkTag.setAttribute('target', '_blanc');

    // if icon url is given add img, otherwise add text
    if (blox.nodeIcon) {
      const iconId = `blockchain_transid_check${index === undefined ? '' : '_' + index}`;
      linkTag.appendChild(
        this.createIconTag(environment.assets_url_prefix + blox.nodeIcon, iconId)
      );
    } else {
      linkTag.innerHTML = titleStr;
    }

    this.resultOutput.appendChild(linkTag);
  }

  public addHeadlineAndInfotext(successful?: boolean, info?: string, errorMsg?: string): void {
    if (successful === undefined) {
      this.resultOutput.appendChild(
        this.createTxtTag(
          i18next.t('PENDING.info'),
          'ubirch-verification-success ubirch-verification-headline'
        )
      );
    } else {
      if (successful) {
        const textTag = this.createTxtTag(
          'FAIL.headline',
          'ubirch-verification-fail ubirch-verification-headline'
        );
        this.sealInfoText.appendChild(textTag);
      } else {
        const textTag = this.createTxtTag(
          info ? info : i18next.t('FAIL.info'),
          'ubirch-verification-fail'
        );
        this.resultOutput.appendChild(textTag);
        if (errorMsg) {
          const textTag = this.createTxtTag(errorMsg, 'ubirch-error-output');
          this.errorOutput.appendChild(textTag);
        }
      }
      // if HIGHLIGHT_PAGE_AFTER_VERIFICATION is set the whole page is flashed in green, if verification returned successful,
      // or red, if verification failed
      this.highlightPage(successful);
    }
  }

  public createTxtTag(txt: string, className: string): HTMLElement {
    const txtTag: HTMLElement = document.createElement('div');
    txtTag.innerHTML = txt;
    txtTag.setAttribute('class', className);

    return txtTag;
  }

  private get template(): string {
    return Object.values(WidgetClassNameSuffixes).reduce((template: string, val: string) => {
      template += `<div class="ubirch-${val}"></div>`;
      return template;
    }, '');
  }

  private cleanAllChilds(element: HTMLElement): void {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  private createIconTag(
    src: string,
    imgTagId: string,
    width?: string,
    height?: string
  ): HTMLElement {
    const imgTag: HTMLElement = document.createElement('img');
    imgTag.setAttribute('width', width ? width : '50');
    imgTag.setAttribute('height', height ? height : '50');
    imgTag.setAttribute('src', src);

    if (imgTagId) {
      imgTag.setAttribute('id', imgTagId);
    }
    return imgTag;
  }

  private highlightPage(successful: boolean): void {
    if (this.highlightPageAfterVerification) {
      const highlightClass = successful ? 'flashgreen' : 'flashred';
      const mainElement = document.getElementsByTagName('main')[0];
      setTimeout((_) => {
        mainElement.classList.toggle(highlightClass);
      }, 100);
      setTimeout((_) => {
        mainElement.classList.toggle(highlightClass);
      }, 2400);
    }
  }
}

window['UbirchVerificationWidget'] = UbirchVerificationWidget;
