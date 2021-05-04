import { BehaviorSubject, Observable } from 'rxjs';
import {
  EError,
  EInfo,
  EMessageType,
  EVerificationState,
  UbirchMessage,
} from '../../models/models';
import { UbirchVerificationWidget } from '../new_widget';

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

      expect(root.querySelector('h1')).toBe(null);
      expect(root.querySelector('p')).toBe(null);
    });
  });

  describe('Messenger states display', () => {
    test('Should properly update HTML on pre-request INFO messages', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.INFO,
          message: 'Sending data to backend for verification',
          code: EInfo.START_VERIFICATION_CALL,
        },
        {
          type: EMessageType.INFO,
          message: 'UPP for that data has been found on Ubirch server',
          code: EInfo.UPP_HAS_BEEN_FOUND,
        },
        // TODO: check that upp contains given hash
        // TODO: check signature, ...
        {
          type: EMessageType.INFO,
          message: 'Blockchain anchors found successfully',
          code: EInfo.BLXTXS_FOUND_SUCCESS,
        },
        {
          type: EMessageType.INFO,
          message: 'The data has not yet anchored in any blockchain',
          code: EInfo.NO_BLXTX_FOUND,
        },
      ];

      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      messages.forEach((msg: UbirchMessage) => {
        subject.next(msg);

        const headline = root.querySelector('h1');
        expect(headline).not.toBe(null);
        expect(headline.textContent.includes(msg.message)).toBe(true);
      });
    });

    test('Should properly update HTML on ERROR messages', () => {
      const messages: UbirchMessage[] = [
        {
          type: EMessageType.ERROR,
          code: EError.VERIFICATION_UNAVAILABLE,
          message: 'Verification service is not available!',
          errorDetails: {
            errorMessage: 'Test response',
          },
        },
      ];
      const message: UbirchMessage = {
        type: EMessageType.ERROR,
        code: EError.VERIFICATION_UNAVAILABLE,
        message: 'Verification service is not available!',
        errorDetails: {
          errorMessage: 'Test response',
        },
      };
      subject.next(message);
      new UbirchVerificationWidget({ hostSelector: 'body', messenger });
      const headline = root.querySelector('h1');
      const errorOutput = root.querySelector('p');
      expect(headline).not.toBe(null);
      expect(headline.textContent.includes(message.message)).toBe(true);
      expect(errorOutput).not.toBe(null);
      expect(errorOutput.textContent.includes(message.errorDetails.errorMessage)).toBe(true);
    });
  });
});
