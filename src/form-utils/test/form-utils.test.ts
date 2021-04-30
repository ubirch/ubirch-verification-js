import { UbirchFormUtils } from '../form-utils';

beforeEach(() => {});

describe('Get params from URL', () => {
  test('should get params', () => {
    global.window.history.pushState({}, '', '?a=1;b=2');
    const formUtils = new UbirchFormUtils({ formIds: [] });
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ a: '1', b: '2' });
  });
  test('should get param', () => {
    global.window.history.pushState({}, '', '?c=3');
    const formUtils = new UbirchFormUtils({ formIds: [] });
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ c: '3' });
  });
  test('should get params with array', () => {
    global.window.history.pushState({}, '', '?d=4;e=5,6,7');
    const formUtils = new UbirchFormUtils({ formIds: [] });
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({ d: '4', e: ['5', '6', '7'] });
  });
  test('should get params started with hash and divided by ampersand', () => {
    global.window.history.pushState({}, '', '#d=4&e=5,6,7');
    const formUtils = new UbirchFormUtils({ formIds: [] });
    const result = formUtils.getFormParamsFromUrl(global.window, '&');
    expect(result).toEqual({ d: '4', e: ['5', '6', '7'] });
  });
  test("shouldn't get params", () => {
    global.window.history.pushState({}, '', '?');
    const formUtils = new UbirchFormUtils({ formIds: [] });
    const result = formUtils.getFormParamsFromUrl(global.window, ';');
    expect(result).toEqual({});
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
    const formUtils = new UbirchFormUtils({ formIds: [] });
    formUtils.setDataIntoForm({ a: 'testA', b: 'testB' }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('b') as HTMLInputElement).value).toEqual('testB');
    expect((document.getElementById('c') as HTMLInputElement).value).toEqual('');
  });
  test('should set only available input fields', () => {
    document.body.innerHTML = `
    <form>
      <div id="a"></div>
      <input id="b"/>
      <input id="c"/>
    </form>
    `;
    const formUtils = new UbirchFormUtils({ formIds: [] });
    formUtils.setDataIntoForm({ a: 'testA', b: 'testB' }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toBeUndefined();
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
    const formUtils = new UbirchFormUtils({ formIds: [] });
    formUtils.setDataIntoForm({ a: 'testA', b: ['testB1', 'testB2'] }, document);
    expect((document.getElementById('a') as HTMLInputElement).value).toEqual('testA');
    expect((document.getElementById('b_0') as HTMLInputElement).value).toEqual('testB1');
    expect((document.getElementById('b_1') as HTMLInputElement).value).toEqual('testB2');
  });
});
