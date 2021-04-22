import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import environment from '../environment';
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import { EError, ELanguages } from '../models/models';

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

interface Translations { [key: string]: (string | { [key: string]: string }) };

const languageMap: { [key in ELanguages]: Translations } = {
  de,
  en,
};

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private sealInfoText: HTMLElement;
  private sealOutput: HTMLElement;
  private resultOutput: HTMLElement;
  private errorOutput: HTMLElement;
  private messages: Translations;
  public highlightPageAfterVerification: boolean = false;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.elementSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.host.insertAdjacentHTML('beforeend', this.template);
    this.sealOutput = this.host.querySelector('.ubirch');
    this.sealInfoText = this.host.querySelector(WidgetClassNameSuffixes.InfoText);
    this.sealOutput = this.host.querySelector(WidgetClassNameSuffixes.SealOutput);
    this.resultOutput = this.host.querySelector(WidgetClassNameSuffixes.ResultOutput);
    this.errorOutput = this.host.querySelector(WidgetClassNameSuffixes.ErrorOutput);
    this.messages =
      config.language && languageMap[config.language]
        ? languageMap[config.language]
        : languageMap.de;
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

  private highlightPage(successful: boolean) {
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
