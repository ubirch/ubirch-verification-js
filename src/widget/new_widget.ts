import { Observable } from "rxjs";
import { EError, ELanguages, IUbirchMessage, IUbirchVerificationResult } from "../models/models";
import { initTranslation } from "../utils/i18n";
import * as de from '../assets/i18n/widget/de.json';
import * as en from '../assets/i18n/widget/en.json';
import environment from '../environment';

initTranslation({ en, de })

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
  infoWatcher?: Observable<IUbirchMessage>;
}

export class UbirchVerificationWidget {
  private host: HTMLElement;
  private sealInfoText: HTMLElement;
  private sealOutput: HTMLElement;
  private resultOutput: HTMLElement;
  private errorOutput: HTMLElement;

  constructor(config: IUbirchVerificationWidgetConfig) {
    const host = document.querySelector(config.hostSelector);
    if (!host) throw new Error(EError.ELEMENT_FOR_WIDGET_SELECTOR_NOT_FOUND);
    this.host = host as HTMLElement;
    this.init();
  }

  private init(): void {
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