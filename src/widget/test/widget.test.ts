import UbirchVerificationWidget from '../';
import { WidgetClassNameSuffixes } from '../widget';

describe('Widget', () => {
  test('If widget mounts in the host element', () => {
    const root = document.body;
    new UbirchVerificationWidget({ elementSelector: 'body' });

    Object.values(WidgetClassNameSuffixes).forEach((suffix) => {
      expect(root.querySelector(`.ubirch-${suffix}`)).not.toBe(null);
    });
  });
});
