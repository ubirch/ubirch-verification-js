import { FormUtils } from '../form-utils';

beforeEach(() => {});

describe('Get params from URL', () => {
  test('should get params', () => {
    global.window.history.pushState({}, '', '?a=1&b=2');
    const result = FormUtils.getFormParamsFromUrl(global.window);
    expect(result).toEqual({ a: '1', b: '2' });
  });
});
