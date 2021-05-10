import { UbirchFormUtils } from '../form-utils';
import { messageSubject$ } from '../../messenger';
import { EError, EMessageType, UbirchMessage } from '../../models/models';

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

  test('should emit error on not allowed chars', () => {
    global.window.history.pushState({}, '', '#a=^');
    const infoReceived: UbirchMessage[] = [];

    messageSubject$.next(null);
    const subscription = messageSubject$.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message);
      }
    });

    const formUtils = new UbirchFormUtils();

    expect(() => formUtils.getFormParamsFromUrl(global.window, ';')).toThrowError();
    expect(infoReceived).toEqual([
      {
        code: EError.URL_PARAMS_CORRUPT,
        errorDetails: { notAllowedChars: ['^'] },
        message:
          'Called URL (from QRCode) contains at least one not allowed character that could corrupt this verification',
        type: EMessageType.ERROR,
      },
    ]);
    subscription.unsubscribe();
  });

  test('should emit and throw error on malformmed location', () => {
    const infoReceived: UbirchMessage[] = [];

    messageSubject$.next(null);
    const subscription = messageSubject$.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message);
      }
    });
    const malformedWindow = {} as Window;
    const formUtils = new UbirchFormUtils();

    expect(() => formUtils.getFormParamsFromUrl(malformedWindow, ';')).toThrow();
    expect(infoReceived).toEqual([
      {
        code: EError.LOCATION_MALFORMED,
        errorDetails: undefined,
        message: 'Called URL (from QRCode) is not in a correct URL format',
        type: EMessageType.ERROR,
      },
    ]);
    subscription.unsubscribe();
  });

  test('should emit and throw error on corrupt url params', () => {
    global.window.history.pushState({}, '', '#a=%E0%A4%A');
    const infoReceived: UbirchMessage[] = [];

    messageSubject$.next(null);
    const subscription = messageSubject$.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message);
      }
    });

    const formUtils = new UbirchFormUtils();
    expect(() => formUtils.getFormParamsFromUrl(global.window, ';')).toThrowError();
    expect(infoReceived).toEqual([
      {
        code: EError.URL_PARAMS_CORRUPT,
        errorDetails: {
          errorMessage: 'URI malformed',
        },
        message:
          'Called URL (from QRCode) contains at least one not allowed character that could corrupt this verification',
        type: EMessageType.ERROR,
      },
    ]);
    subscription.unsubscribe();
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

  test('should emit and throw error on malformmed document', () => {
    const infoReceived: UbirchMessage[] = [];

    messageSubject$.next(null);
    const subscription = messageSubject$.subscribe((message: UbirchMessage) => {
      if (message !== null) {
        infoReceived.push(message);
      }
    });
    const malformedDocument = {} as Document;
    const formUtils = new UbirchFormUtils();
    expect(() =>
      formUtils.setDataIntoForm({ a: 'testA', c: ['testC0', 'testC2'] }, malformedDocument)
    ).toThrow();
    expect(infoReceived).toEqual([
      {
        code: EError.FILLING_FORM_WITH_PARAMS_FAILED,
        errorDetails: {
          errorMessage: 'documentRef.getElementById is not a function',
        },
        message: 'Unable to fill the form with the given parameters from called URL',
        type: EMessageType.ERROR,
      },
    ]);
    subscription.unsubscribe();
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
