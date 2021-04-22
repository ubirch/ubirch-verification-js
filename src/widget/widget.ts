import * as BlockchainSettings from '../blockchain-assets/blockchain-settings.json';
import environment from '../environment';
import { EError } from '../models/models';

export enum WidgetClassNameSuffixes {
  InfoText = 'info-text',
  SealOutput = 'seal-output',
  ResultOutput = 'result-output',
  ErrorOutput = 'error-output',
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private sealInfoText: HTMLElement;
  private sealOutput: HTMLElement;
  private resultOutput: HTMLElement;
  private errorOutput: HTMLElement;

  constructor(elementSelectorP: string, private openConsoleInSameTarget: boolean = false) {
    const host = document.querySelector(elementSelectorP);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.host.insertAdjacentHTML('beforeend', this.template);
    this.sealOutput = this.host.querySelector('.ubirch');
    this.sealInfoText = this.host.querySelector(WidgetClassNameSuffixes.InfoText);
    this.sealOutput = this.host.querySelector(WidgetClassNameSuffixes.SealOutput);
    this.resultOutput = this.host.querySelector(WidgetClassNameSuffixes.ResultOutput);
    this.errorOutput = this.host.querySelector(WidgetClassNameSuffixes.ErrorOutput);
  }

  private get template(): string {
    return Object.values(WidgetClassNameSuffixes).reduce((template: string, val: string) => {
      template += `<div class="ubirch-${val}"></div>`;
      return template;
    }, '');
  }
}

window['UbirchVerificationWidget'] = UbirchVerificationWidget;
