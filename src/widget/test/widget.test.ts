import { BehaviorSubject, Observable } from 'rxjs';
import {
  EError,
  EInfo,
  EMessageType,
  EVerificationState,
  UbirchMessage,
} from '../../models/models';
import { UbirchVerificationWidget } from '../widget';
import * as en from '../../assets/i18n/widget/en.json';

let root: HTMLElement;
let subject: BehaviorSubject<UbirchMessage>;
let messenger: Observable<UbirchMessage>;

beforeAll(() => {
  root = document.body;
});

afterAll(() => {
  root.innerHTML = '';
  root = null;
});

beforeEach(() => {
  subject = new BehaviorSubject(null);
  messenger = subject.asObservable();
});

describe('Widget', () => {
  describe('Mounting', () => {
    test('If widget mounts in the host element', () => {
      new UbirchVerificationWidget({ hostSelector: 'body', messenger });

      expect(root.querySelector('#ubirch-verification-widget-headline')).toBe(null);
      expect(root.querySelector('#ubirch-verification-widget-result-text')).toBe(null);
    });
  });

  describe('Messenger states display', () => {
    test('Should properly update HTML on INFO messages', () => {
      const messages: UbirchMessage[] = Object.entries(en.info).map(([key, val]) => ({
        type: EMessageType.INFO,
        message: val,
        code: EInfo[key]
      }));

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg: UbirchMessage) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(en['verification-state']['VERIFICATION_PENDING'])).toBe(
          true
        );
        expect(result).not.toBe(null);
        expect(result.textContent.includes(msg.message)).toBe(true);
      });
    });

    test('Should properly update HTML on ERROR messages', () => {
      const messages: UbirchMessage[] = Object.entries(en.error).map(([key, value]) => ({
        type: EMessageType.ERROR,
        code: EError[key],
        message: value,
      }));

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });

      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const errorOutput = root.querySelector('#ubirch-verification-widget-result-text');
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(en['verification-state']['VERIFICATION_FAILED'])).toBe(true);
        expect(errorOutput).not.toBe(null);
        expect(errorOutput.textContent.includes(msg.message)).toBe(true);
      });
    });

    test('Should properly update html on verification state messages', () => {
      const messages: UbirchMessage[] = Object.entries(en['verification-state']).map(
        ([key, value]) => ({
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState[key],
          message: value,
        })
      );
      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(en['verification-state'][msg.code]));
      });
    });
  });
});
