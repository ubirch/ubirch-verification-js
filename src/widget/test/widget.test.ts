import * as en from '../../assets/i18n/en.json';
import { EError, EInfo, EMessageType, EStages, EUppStates, EVerificationState, IUbirchError, IUbirchErrorDetails, IUbirchVerificationResult, UbirchMessage } from '../../models/models';
import i18n from '../../utils/translations';
import { IUbirchVerificationWidgetConfig, UbirchVerificationWidget } from '../widget';
import testAnchors from './valid-anchors.json';

class UbirchVerificationWidgetMock extends UbirchVerificationWidget {
  constructor(config: IUbirchVerificationWidgetConfig) {
    super(config);
  }

  public handleError(info: EError, errorDetails?: IUbirchErrorDetails): void {
    super.handleError(info, errorDetails);
  }

  public handleInfo(info: EInfo): void {
    super.handleInfo(info);
  }

  public handleVerificationState(code: EVerificationState, result?: IUbirchVerificationResult): void {
    super.handleVerificationState(code, result);
  }

}

let root: HTMLElement;

const defaultSettings: IUbirchVerificationWidgetConfig = {
  accessToken:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiZDYzZWNjMDMtZjVhNy00ZDQzLTkxZDAtYTMwZDAzNGQ4ZGEzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2MTk4MjA2MzAsImlhdCI6MTYxMjQzNTI4MCwianRpIjoiOGJkMzExZDItZGEyYi00ZWJhLWExMmMtODYxYjRiYWU2MjliIiwidGFyZ2V0X2lkZW50aXRpZXMiOiIqIiwicm9sZSI6InZlcmlmaWVyIiwic2NvcGUiOiJ2ZXIiLCJwdXJwb3NlIjoiVWJpcmNoIERlZmF1bHQgVG9rZW4iLCJvcmlnaW5fZG9tYWlucyI6W119.tDovGseqjwaJZNX0ZtoGmZVvkcdVltR1nXYYAFpF4DHGAQ8MiRAfeJIYL0TNHsqBt_-60fw2j65neje_ThJ7Eg',
  stage: EStages.dev,
  hostSelector: 'body',
};

const successVerificationMessage: UbirchMessage = {
  type: EMessageType.VERIFICATION_STATE,
  code: EVerificationState.VERIFICATION_SUCCESSFUL,
  message: en[ 'verification-state' ].VERIFICATION_SUCCESSFUL,
  result: {
    hash: 'fDqiCojhrAUSaDPIUi52msChXyB3VRWFWAT+V0WhFiQ=',
    upp: {
      upp:
        'liPEEM+T+e6L9EzBtxV79B2I5hbEQLKeDjxuX6RTp6/kKnsJR+cd3exsAqA/8oJXdYjzVvfWG3I3QXeqzTdAgJj8No6sL0ltaSGWjzEwBAy+fx+ZdCkAxCB8OqIKiOGsBRJoM8hSLnaawKFfIHdVFYVYBP5XRaEWJMRAPYfV3BJ4goY6HUxSNcB6Wu48Y+5iRqsuRdUT4dlidzaD9bjub7DxN75sXzf5uOgn26lZ1asuPsfKPWaYuciXTQ==',
      state: EUppStates.anchored,
    },
    anchors: testAnchors,
    verificationState: EVerificationState.VERIFICATION_SUCCESSFUL,
    firstAnchorTimestamp: '2021-01-27T17:37:16.543Z',
  },
};

beforeAll(() => {
  root = document.body;
});

afterAll(() => {
  root.innerHTML = '';
  root = null;
});

describe('Widget', () => {
  describe('Mounting', () => {
    test('If widget mounts in the host element', () => {
      new UbirchVerificationWidget(defaultSettings);

      expect(root.querySelector('#ubirch-verification-widget-headline')).toBe(null);
      expect(root.querySelector('#ubirch-verification-widget-result-text')).toBe(null);
    });

    test('If it throws error when the selector is not found', () => {
      expect(() => {
        new UbirchVerificationWidget({ ...defaultSettings, hostSelector: '#selector' });
      }).toThrowError('Element for widget selector not found');
    });
  });

  describe('Messenger states display', () => {
    test('Should properly update HTML on INFO messages', () => {
      const messages: UbirchMessage[] = Object.keys(en.info).map((key) => ({
        type: EMessageType.INFO,
        message: i18n.t(`default:info.${key}`),
        code: EInfo[ key ],
      }));

      const widget = new UbirchVerificationWidgetMock({ ...defaultSettings });
      messages.forEach((msg: UbirchMessage) => {
        widget.handleInfo(msg.code as EInfo);
        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(result.textContent).toContain(msg.message);
      });
    });

    test('Should properly update HTML on ERROR messages', () => {
      const messages: UbirchMessage[] = Object.keys(en.error).map((key) => ({
        type: EMessageType.ERROR,
        code: EError[ key ],
        message:
          key === EError.VERIFICATION_UNAVAILABLE
            ? i18n.t(`default:error.${key}`, { message: 'Lorem ipsum' })
            : i18n.t(`default:error.${key}`),
        errorDetails:
          key === EError.VERIFICATION_UNAVAILABLE ? { errorMessage: 'Lorem ipsum' } : undefined,
      }));

      const widget = new UbirchVerificationWidgetMock({ ...defaultSettings });

      messages.forEach((msg: IUbirchError) => {
        expect(() => widget.handleError(msg.code as EError, msg.errorDetails as IUbirchErrorDetails)).toThrowError();

        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(result).not.toBe(null);
        expect(result.textContent).toContain(msg.message);
        expect(result.textContent.includes(msg.message)).toBe(true);
      });
    });

    test('Should properly update html on verification state messages', () => {
      const messages: UbirchMessage[] = Object.entries(en[ 'verification-state' ]).map(
        ([ key, value ]) => ({
          type: EMessageType.VERIFICATION_STATE,
          code: EVerificationState[ key ],
          message: value,
        }),
      );

      const widget = new UbirchVerificationWidgetMock({ ...defaultSettings });
      messages.forEach((msg: UbirchMessage) => {
        widget.handleVerificationState(msg.code as EVerificationState);
        const headline = root.querySelector('#ubirch-verification-widget-headline');

        expect(headline.textContent).toContain(
          msg.message,
        );
      });
    });

      test('Should properly reflect successful verification', () => {
        const messages: UbirchMessage[] = [
          {
            type: EMessageType.VERIFICATION_STATE,
            code: EVerificationState.VERIFICATION_PENDING,
            message: en['verification-state'].VERIFICATION_PENDING,
          },
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
          successVerificationMessage,
        ];

        const widget = new UbirchVerificationWidgetMock(defaultSettings);

        // process calls
        messages.forEach((msg) => {
          if (msg.type === EMessageType.INFO) {
            widget.handleInfo(msg.code as EInfo);
          } else if (msg.type === EMessageType.VERIFICATION_STATE) {
            widget.handleVerificationState(msg.code as EVerificationState);
          }
        });

        const result = root.querySelector('#ubirch-verification-widget-result-text');
        expect(result.textContent).toContain('Blockchain anchors found successfully');
        const headline = root.querySelector('#ubirch-verification-widget-headline');
        expect(headline.textContent).toContain('Verification successful!');

      });

    //   test('Should properly reflect partly successful verification', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.UPP_HAS_BEEN_FOUND,
    //         message: en.info.UPP_HAS_BEEN_FOUND,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.NO_BLXTX_FOUND,
    //         message: en.info.NO_BLXTX_FOUND,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL,
    //         message: en['verification-state'].VERIFICATION_PARTLY_SUCCESSFUL,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_PARTLY_SUCCESSFUL,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain('Verification only partly successful');
    //     expect(result.textContent).toContain('The data has not been anchored in any blockchain yet');
    //   });
    //
    //   test('Should properly reflect failed verification (UPP undefined)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE,
    //         message: en.error.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain(
    //       'Verification Failed!! Empty certificate or missing seal'
    //     );
    //   });
    //
    //   test('Should properly reflect failed verification (403)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE,
    //         message: en.error.CERTIFICATE_ANCHORED_BY_NOT_AUTHORIZED_DEVICE,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain('403 - unauthorized');
    //   });
    //
    //   test('Should properly reflect failed verification (404)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.CERTIFICATE_ID_CANNOT_BE_FOUND,
    //         message: en.error.CERTIFICATE_ID_CANNOT_BE_FOUND,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain('Certificate cannot be found!');
    //   });
    //
    //   test('Should properly reflect failed verification (500)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.INTERNAL_SERVER_ERROR,
    //         message: en.error.INTERNAL_SERVER_ERROR,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain('Internal Server Error. Something went wrong.');
    //   });
    //
    //   test('Should properly reflect failed verification (Unknown error)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.UNKNOWN_ERROR,
    //         message: en.error.UNKNOWN_ERROR,
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain('An unexpected error occurred');
    //   });
    //
    //   test('Should properly reflect failed verification (verification unavailable)', () => {
    //     const messages: UbirchMessage[] = [
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_VERIFICATION_CALL,
    //         message: en.info.START_VERIFICATION_CALL,
    //       },
    //       {
    //         type: EMessageType.INFO,
    //         code: EInfo.START_CHECKING_RESPONSE,
    //         message: en.info.START_CHECKING_RESPONSE,
    //       },
    //       {
    //         type: EMessageType.ERROR,
    //         code: EError.VERIFICATION_UNAVAILABLE,
    //         message: i18n.t(`default:error.${EError.VERIFICATION_UNAVAILABLE}`, {
    //           message: 'Lorem ipsum',
    //         }),
    //         errorDetails: {
    //           errorMessage: 'Lorem ipsum',
    //         },
    //       },
    //       {
    //         type: EMessageType.VERIFICATION_STATE,
    //         code: EVerificationState.VERIFICATION_FAILED,
    //         message: en['verification-state'].VERIFICATION_FAILED,
    //         result: {
    //           hash: '',
    //           upp: {
    //             upp: '',
    //             state: EUppStates.anchored,
    //           },
    //           anchors: [],
    //           verificationState: EVerificationState.VERIFICATION_FAILED,
    //           firstAnchorTimestamp: '',
    //         },
    //       },
    //     ];
    //
    //     new UbirchVerificationWidget({ hostSelector: 'body', messenger });
    //     messages.forEach((msg) => {
    //       subject.next(msg);
    //     });
    //
    //     const headline = root.querySelector('#ubirch-verification-widget-headline');
    //     const result = root.querySelector('#ubirch-verification-widget-result-text');
    //
    //     expect(headline.textContent).toContain(
    //       'Verification failed! No anchor for that data can be found!'
    //     );
    //     expect(result.textContent).toContain('Verification service is not available! Lorem ipsu');
    //   });
  });
  //
  // describe('Blockchain anchor icons', () => {
  //   test('Should render no anchor icons when blockchain is undefined', () => {
  //     new UbirchVerificationWidget({
  //       hostSelector: 'body',
  //       messenger,
  //     });
  //
  //     subject.next({
  //       ...successVerificationMessage,
  //       result: {
  //         ...successVerificationMessage.result,
  //         anchors: invalidTestAnchors,
  //       },
  //     });
  //
  //     const anchorIconsEl = root.querySelector('#ubirch-verification-anchor-icons');
  //     expect(anchorIconsEl.children.length).toBe(0);
  //   });
  //
  //   test('Should render anchor icons when blockchain is defined', () => {
  //     new UbirchVerificationWidget({
  //       hostSelector: 'body',
  //       messenger,
  //     });
  //
  //     subject.next(successVerificationMessage);
  //
  //     const iconsEl = root.querySelector('#ubirch-verification-anchor-icons');
  //     const icons = iconsEl.children;
  //
  //     const firstAnchor = successVerificationMessage.result.anchors[0];
  //     const firstIcon = icons[0];
  //     const firstIconImage = firstIcon.children[0];
  //     const firstBlox = BlockchainSettings.blockchainSettings[firstAnchor.raw.blockchain];
  //     firstBlox.nodeIcon = undefined;
  //     const firstUrl = firstBlox.explorerUrl[firstAnchor.raw.network_type].url;
  //     expect(firstIcon.getAttribute('href')).toContain(
  //       firstUrl
  //     );
  //     expect(firstIconImage.tagName).toBe('IMG');
  //     expect(firstIconImage.getAttribute('id')).toBe(`blockchain_transid_check_0`);
  //     expect(firstIconImage.getAttribute('src')).toContain(environment.assets_url_prefix);
  //     expect(firstIconImage.getAttribute('src')).not.toContain(firstBlox.nodeIcon);
  //   });
  // });
  //
  // describe('Properties setting', () => {
  //   describe('If it sets opening console in the same target correctly', () => {
  //     test('When openConsoleInSameTarget param is not set', () => {
  //       new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         linkToConsole: true,
  //         messenger,
  //       });
  //
  //       subject.next(successVerificationMessage);
  //
  //       const sealOutputEl = root.querySelector('#ubirch-verification-widget-seal-output');
  //
  //       expect(sealOutputEl.classList.length).toBeGreaterThan(0);
  //       expect(sealOutputEl.querySelector('a').hasAttribute('target')).toBe(true);
  //     });
  //
  //     test('When openConsoleInSameTarget param is set', () => {
  //       new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         linkToConsole: true,
  //         openConsoleInSameTarget: true,
  //         messenger,
  //       });
  //
  //       subject.next(successVerificationMessage);
  //
  //       const sealOutputEl = root.querySelector('#ubirch-verification-widget-seal-output');
  //
  //       expect(sealOutputEl.classList.length).toBeGreaterThan(0);
  //       expect(sealOutputEl.querySelector('a').hasAttribute('target')).toBe(false);
  //     });
  //   });
  //
  //   describe('Language settings', () => {
  //     test('If it sets language via method correctly', () => {
  //       const widget = new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         messenger,
  //       });
  //
  //       widget.setLanguage(ELanguages.de);
  //
  //       subject.next({
  //         type: EMessageType.VERIFICATION_STATE,
  //         code: EVerificationState.VERIFICATION_PENDING,
  //         message: en['verification-state'].VERIFICATION_PENDING,
  //       });
  //
  //       const headline = root.querySelector('#ubirch-verification-widget-headline');
  //
  //       expect(headline).not.toBe(null);
  //       expect(headline.textContent).toContain('Verifikation wird durchgeführt...');
  //     });
  //
  //     test('If it sets language via config correctly', () => {
  //       const widget = new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         language: ELanguages.de,
  //         messenger,
  //       });
  //
  //       widget.setLanguage(ELanguages.de);
  //
  //       subject.next({
  //         type: EMessageType.VERIFICATION_STATE,
  //         code: EVerificationState.VERIFICATION_PENDING,
  //         message: en['verification-state'].VERIFICATION_PENDING,
  //       });
  //
  //       const headline = root.querySelector('#ubirch-verification-widget-headline');
  //
  //       expect(headline).not.toBe(null);
  //       expect(headline.textContent).toContain('Verifikation wird durchgeführt...');
  //     });
  //   });
  //
  //   describe('Stage setting', () => {
  //     test('If it sets the stage from the config correctly', () => {
  //       const widget = new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         stage: EStages.prod,
  //         linkToConsole: true,
  //         messenger,
  //       });
  //
  //       widget.setLanguage(ELanguages.de);
  //
  //       subject.next(successVerificationMessage);
  //
  //       const sealIconEl = root.querySelector('#ubirch-verification-widget-seal-output');
  //
  //       expect(sealIconEl.children.length).toBeGreaterThan(0);
  //
  //       const expectedHref = `${environment.console_verify_url.prod}?hash=${encodeURIComponent(
  //         successVerificationMessage.result.hash
  //       )}`;
  //       const href = sealIconEl.querySelector('a').getAttribute('href');
  //       expect(href).toBe(expectedHref);
  //     });
  //   });
  //
  //   describe('linkToConsole settings', () => {
  //     test("If it doesn't display anchored seal correctly", () => {
  //       const widget = new UbirchVerificationWidget({
  //         hostSelector: 'body',
  //         stage: EStages.prod,
  //         messenger,
  //       });
  //
  //       widget.setLanguage(ELanguages.de);
  //
  //       subject.next(successVerificationMessage);
  //
  //       const sealIconEl = root.querySelector('#ubirch-verification-widget-seal-output');
  //
  //       expect(sealIconEl.children.length).toBeGreaterThan(0);
  //       expect(sealIconEl.querySelector('a')).toBe(null);
  //     });
  //   });
  // });
});
