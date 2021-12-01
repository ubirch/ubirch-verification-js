import { EError, EInfo, EMessageType, EStages, IUbirchVerificationConfig, IUbirchVerificationWidgetConfig, UbirchMessage } from '../../models/models';
import UbirchVerification from '../../verification';
import UbirchVerificationWidget from '../../widget';
import { UbirchFormUtils } from '../form-utils';

const defaultSettings: IUbirchVerificationWidgetConfig = {
  accessToken:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiZDYzZWNjMDMtZjVhNy00ZDQzLTkxZDAtYTMwZDAzNGQ4ZGEzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2MTk4MjA2MzAsImlhdCI6MTYxMjQzNTI4MCwianRpIjoiOGJkMzExZDItZGEyYi00ZWJhLWExMmMtODYxYjRiYWU2MjliIiwidGFyZ2V0X2lkZW50aXRpZXMiOiIqIiwicm9sZSI6InZlcmlmaWVyIiwic2NvcGUiOiJ2ZXIiLCJwdXJwb3NlIjoiVWJpcmNoIERlZmF1bHQgVG9rZW4iLCJvcmlnaW5fZG9tYWlucyI6W119.tDovGseqjwaJZNX0ZtoGmZVvkcdVltR1nXYYAFpF4DHGAQ8MiRAfeJIYL0TNHsqBt_-60fw2j65neje_ThJ7Eg',
  stage: EStages.dev,
  hostSelector: 'body',
};
let widgetSettings: IUbirchVerificationWidgetConfig = {
  accessToken: defaultSettings.accessToken,
  stage: defaultSettings.stage,
  hostSelector: '#widget-root',
};

beforeEach(() => {});

describe('Get params from URL', () => {
  test('should get params', () => {
    global.window.history.pushState({}, '', '?a=1;b=2');
    const formUtils = new UbirchFormUtils();
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ a: '1', b: '2' });
  });

  test('should get param', () => {
    global.window.history.pushState({}, '', '?c=3');
    const formUtils = new UbirchFormUtils();
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ c: '3' });
  });

  test('should get params with array', () => {
    global.window.history.pushState({}, '', '?d=4;e=5,6,7');
    const formUtils = new UbirchFormUtils();
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ d: '4', e: ['5', '6', '7'] });
  });

  test('should get params started with hash and divided by ampersand', () => {
    global.window.history.pushState({}, '', '#d=4&e=5,6,7');
    const formUtils = new UbirchFormUtils();
    const result = formUtils.getFormParamsFromUrl(global.window, '&');
    expect(result).toEqual({ d: '4', e: ['5', '6', '7'] });
  });

  test("shouldn't get params", () => {
    global.window.history.pushState({}, '', '?');
    const formUtils = new UbirchFormUtils();
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({});
  });

  test('should emit error on not allowed chars', done => {
    global.window.history.pushState({}, '', '#a=^');

    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(defaultSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EError.URL_PARAMS_CORRUPT,
            errorDetails: { notAllowedChars: ['^'] },
            message:
              'Called URL (from QRCode) contains at least one not allowed character that could corrupt this verification',
            type: EMessageType.ERROR,
          },
        );
        subscription.unsubscribe();
        done();
      }
    });

    expect(() => formUtils.getFormParamsFromUrl(global.window, ';')).toThrowError();
  });

  test('should emit and throw error on malformmed location', done => {
    const malformedWindow = {} as Window;
    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(defaultSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EError.LOCATION_MALFORMED,
            errorDetails: undefined,
            message: 'Called URL (from QRCode) is not in a correct URL format',
            type: EMessageType.ERROR,
          });
        subscription.unsubscribe();
        done();
      }
    });

    expect(() => formUtils.getFormParamsFromUrl(malformedWindow, ';')).toThrow();
  });

  test('should emit and throw error on corrupt url params', done => {
    global.window.history.pushState({}, '', '#a=%E0%A4%A');

    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(defaultSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EError.URL_PARAMS_CORRUPT,
            errorDetails: {
              errorMessage: 'URI malformed',
            },
            message:
              'Called URL (from QRCode) contains at least one not allowed character that could corrupt this verification',
            type: EMessageType.ERROR,
          });
        subscription.unsubscribe();
        done();
      }
    });

    expect(() => formUtils.getFormParamsFromUrl(global.window, ';')).toThrowError();
  });

  test('should send successful info when parsed form params successfully', done => {
    global.window.history.pushState({}, '', '?a=1;b=2');
    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(defaultSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EInfo.URL_PARAMS_PARSED_SUCCESS,
            message: 'The given parameters from called URL have been parsed successfully',
            type: EMessageType.INFO
          });
        subscription.unsubscribe();
        done();
      }
    });
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
  });
});

describe('Fill inputs with data', () => {
  test('should set fields', () => {
    document.body.innerHTML = `
    <form>
      <input id="a"/>
      <input id="b"/>
      <input id="c"/>
    </form>
    `;
    const formUtils = new UbirchFormUtils();
    formUtils.setDataIntoForm({ a: 'testA', b: 'testB' }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('b') as HTMLInputElement).value).toEqual('testB');
    expect((document.getElementById('c') as HTMLInputElement).value).toEqual('');
  });

  test('should send successful info when form was filled with params successfully', done => {
    document.body.innerHTML = `
    <form>
      <input id="a"/>
      <input id="b"/>
      <input id="c"/>
    </form>
    <div id="widget-root"></div>
    `;
    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(widgetSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EInfo.URL_PARAMS_FORMFILL_SUCCESS,
            message: 'Successfully filled form with the given parameters from called URL',
            type: EMessageType.INFO
          });
        subscription.unsubscribe();
        done();
      }
    });

    formUtils.setDataIntoForm({ a: 'testA', b: 'testB' }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('b') as HTMLInputElement).value).toEqual('testB');
    expect((document.getElementById('c') as HTMLInputElement).value).toEqual('');
  });

  test('should set data with array to fields', () => {
    document.body.innerHTML = `
    <form>
      <input id="a"/>
      <input id="b_0"/>
      <input id="b_1"/>
    </form>
    `;
    const formUtils = new UbirchFormUtils();
    formUtils.setDataIntoForm({ a: 'testA', b: ['testB0', 'testB1'] }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('b_0') as HTMLInputElement).value).toEqual('testB0');
    expect((document.getElementById('b_1') as HTMLInputElement).value).toEqual('testB1');
  });

  test('should set only available input fields', () => {
    document.body.innerHTML = `
    <form>
      <div id="a"></div>
      <input id="b"/>
      <input id="c_0"/>
      <div id="c_1"/>
      <input id="c_2"/>
    <div id="widget-root"></div>
    </form>
    `;
    const formUtils = new UbirchFormUtils();
    formUtils.setDataIntoForm({ a: 'testA', c: ['testC0', 'testC2'] }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toBeUndefined();
    expect((document.getElementById('b') as HTMLInputElement).value).toEqual('');
    expect((document.getElementById('c_0') as HTMLInputElement).value).toEqual('testC0');
    expect((document.getElementById('c_1') as HTMLInputElement).value).toBeUndefined();
    expect((document.getElementById('c_2') as HTMLInputElement).value).toEqual('');
  });

  test('should emit and throw error on malformmed document', done => {
    const malformedDocument = {} as Document;
    const formUtils = new UbirchFormUtils();
    const verification = new UbirchVerificationWidget(widgetSettings, formUtils);

    const subscription = verification.messenger.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        expect(message).toEqual(
          {
            code: EError.URL_PARAMS_FORMFILL_FAILED,
            errorDetails: {
              errorMessage: 'documentRef.getElementById is not a function',
            },
            message: 'Unable to fill the form with the given parameters from called URL',
            type: EMessageType.ERROR,
          });
        subscription.unsubscribe();
        done();
      }
    });
    expect(() =>
      formUtils.setDataIntoForm({ a: 'testA', c: ['testC0', 'testC2'] }, malformedDocument)
    ).toThrow();

  });
});

describe('Form ids mapping', () => {
  test('should set input fields due to mapping', () => {
    document.body.innerHTML = `
    <form>
      <input id="Am"/>
      <input id="Bm"/>
      <input id="Cm_0"/>
      <input id="Cm_1"/>
    </form>
    `;
    const formUtils = new UbirchFormUtils({
      formIds: ['Am', 'Bm', 'Cm'],
      paramsFormIdsMapping: ['a', 'b', 'c'],
    });
    formUtils.setDataIntoForm({ a: 'testA', b: 'testB', c: ['testC0', 'testC1'] }, document);
    expect((document.getElementById('Am') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('Bm') as HTMLInputElement).value).toEqual('testB');
    expect((document.getElementById('Cm_0') as HTMLInputElement).value).toEqual('testC0');
    expect((document.getElementById('Cm_1') as HTMLInputElement).value).toEqual('testC1');
  });

  test('should throw and emit error on wrong mappings counts', () => {
    expect(
      () =>
        new UbirchFormUtils({
          formIds: ['Am', 'Bm', 'Cm'],
          paramsFormIdsMapping: ['a', 'b'],
        })
    ).toThrowError(
      'If you provide paramsFormIdsMapping define a mapping for each formId; they need to be in the same order'
    );
  });

  test('should handle and console warning on not mmapping defined for parameter', () => {
    document.body.innerHTML = `
    <form>
      <input id="Am"/>
      <input id="Bm"/>
      <input id="Cm_0"/>
      <input id="Cm_1"/>
    </form>
    `;

    const consoleWarnBuf = global.console.warn;
    global.console.warn = jest.fn();
    const formUtils = new UbirchFormUtils({
      formIds: ['Am', 'Bm'],
      paramsFormIdsMapping: ['a', 'b'],
    });
    formUtils.setDataIntoForm({ a: 'testA', b: 'testB', c: ['testC0', 'testC1'] }, document);
    expect(global.console.warn).toBeCalledWith('No mapping defined for c');
    expect((document.getElementById('Am') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('Bm') as HTMLInputElement).value).toEqual('testB');
    expect((document.getElementById('Cm_0') as HTMLInputElement).value).toEqual('');
    expect((document.getElementById('Cm_1') as HTMLInputElement).value).toEqual('');

    global.console.warn = consoleWarnBuf;
  });
});
