import { BehaviorSubject, Observable } from 'rxjs';
import {
  EError,
  EInfo,
  EMessageType,
  EUppStates,
  EVerificationState,
  UbirchMessage,
} from '../../models/models';
import { UbirchVerificationWidget } from '../widget';
import * as en from '../../assets/i18n/widget/en.json';
import i18n from '../../utils/translations';

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
      const messages: UbirchMessage[] = Object.keys(en.info).map((key) => ({
        type: EMessageType.INFO,
        message: i18n.t(`widget:info.${key}`),
        code: EInfo[key],
      }));

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg: UbirchMessage) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(headline).not.toBe(null);
        expect(
          headline.textContent.includes(en['verification-state']['VERIFICATION_PENDING'])
        ).toBe(true);
        expect(result).not.toBe(null);
        expect(result.textContent.includes(msg.message)).toBe(true);
      });
    });

    test('Should properly update HTML on ERROR messages', () => {
      const messages: UbirchMessage[] = Object.keys(en.error).map((key) => ({
        type: EMessageType.ERROR,
        code: EError[key],
        message:
          key === EError.VERIFICATION_UNAVAILABLE
            ? i18n.t(`widget:error.${key}`, { message: 'Lorem ipsum' })
            : i18n.t(`widget:error.${key}`),
        errorDetails:
          key === EError.VERIFICATION_UNAVAILABLE ? { errorMessage: 'Lorem ipsum' } : undefined,
      }));

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });

      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(en['verification-state']['VERIFICATION_FAILED'])).toBe(
          true
        );
        expect(result).not.toBe(null);
        expect(result.textContent.includes(msg.message)).toBe(true);
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

    test('Should properly reflect successful verification', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.UPP_HAS_BEEN_FOUND,
          message: en.info.UPP_HAS_BEEN_FOUND,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.BLXTXS_FOUND_SUCCESS,
          message: en.info.BLXTXS_FOUND_SUCCESS,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_SUCCESSFUL,
          message: en['verification-state'].VERIFICATION_SUCCESSFUL,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_SUCCESSFUL,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });

      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        const resultText = getResultText(en.info.BLXTXS_FOUND_SUCCESS, msg);
        const expectedHeadline = headlineText(msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect partly successful verification', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.UPP_HAS_BEEN_FOUND,
          message: en.info.UPP_HAS_BEEN_FOUND,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.NO_BLXTX_FOUND,
          message: en.info.NO_BLXTX_FOUND,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL,
          message: en['verification-state'].VERIFICATION_PARTLY_SUCCESSFUL,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });

      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        const resultText = getResultText(en.info.NO_BLXTX_FOUND, msg);
        const expectedHeadline = headlineText(msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (UPP undefined)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE,
          message: en.error.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: ''
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        const resultText = getResultText(
          en.error.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE,
          msg
        );
        const expectedHeadline = headlineText(msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (403)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE,
          message: en.error.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');

        const expectedHeadline = headlineText(msg);
        const resultText = getResultText(
          en.error.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE,
          msg
        );
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (404)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.CERTIFICATE_ID_CANNOT_BE_FOUND,
          message: en.error.CERTIFICATE_ID_CANNOT_BE_FOUND,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');

        const expectedHeadline = headlineText(msg);
        const resultText = getResultText(en.error.CERTIFICATE_ID_CANNOT_BE_FOUND, msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (500)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.INTERNAL_SERVER_ERROR,
          message: en.error.INTERNAL_SERVER_ERROR,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');

        const expectedHeadline = headlineText(msg);
        const resultText = getResultText(en.error.INTERNAL_SERVER_ERROR, msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (Unknown error)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.UNKNOWN_ERROR,
          message: en.error.UNKNOWN_ERROR,
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');

        const expectedHeadline = headlineText(msg);
        const resultText = getResultText(en.error.UNKNOWN_ERROR, msg);
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });

    test('Should properly reflect failed verification (verification unavailable)', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          code: EInfo.START_VERIFICATION_CALL,
          message: en.info.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          code: EInfo.START_CHECKING_RESPONSE,
          message: en.info.START_CHECKING_RESPONSE,
        },
        {
          type: EMessageType.ERROR,
          code: EError.VERIFICATION_UNAVAILABLE,
          message: i18n.t(`widget:error.${EError.VERIFICATION_UNAVAILABLE}`, {
            message: 'Lorem ipsum',
          }),
          errorDetails: {
            errorMessage: 'Lorem ipsum',
          },
        },
        {
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState.VERIFICATION_FAILED,
          message: en['verification-state'].VERIFICATION_FAILED,
          result: {
            hash: '',
            upp: {
              upp: '',
              state: EUppStates.anchored,
            },
            anchors: [],
            verificationState: EVerificationState.VERIFICATION_FAILED,
            firstAnchorTimestamp: '',
          },
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg) => {
        subject.next(msg);
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        const result = root.querySelector('#ubirch-verification-widget-result-text');

        const expectedHeadline = headlineText(msg);
        const resultText = getResultText(
          i18n.t(`widget:error.${EError.VERIFICATION_UNAVAILABLE}`, { message: 'Lorem ipsum' }),
          msg
        );
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(expectedHeadline));
        expect(result).not.toBe(null);
        expect(result.textContent.includes(resultText)).toBe(true);
      });
    });
  });
});

function headlineText(message: UbirchMessage): string {
  let suffix: string = '';
  if (message.type === EMessageType.ERROR) suffix = 'VERIFICATION_FAILED';
  else if (message.type === EMessageType.VERIFICATION_STATE)
    suffix = message.result.verificationState;
  else suffix = 'VERIFICATION_PENDING';
  return en[EMessageType.VERIFICATION_STATE][suffix];
}

function getResultText(verificationText: string, msg: UbirchMessage): string {
  return msg.type === EMessageType.VERIFICATION_STATE ? verificationText : msg.message;
}
