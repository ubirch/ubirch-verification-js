import { BehaviorSubject } from 'rxjs';
import { EError, EMessageType, UbirchMessage } from '../../models/models';
import { UbirchVerificationWidget } from '../new_widget';

describe('Widget', () => {
  test('If widget mounts in the host element', () => {
    const root = document.body;
    const subject = new BehaviorSubject<UbirchMessage>(null);
    const messenger = subject.asObservable();
    new UbirchVerificationWidget({ hostSelector: 'body', messenger });

    const message = 'Lorem ipsum';
    subject.next({
      type: EMessageType.ERROR,
      message,
      code: EError.CERTIFICATE_ID_CANNOT_BE_FOUND,
    });

    expect(root.querySelector('h1')).not.toBe(null);
    expect(root.querySelector('h1').textContent.includes(message)).toBe(true);
    expect(root.querySelector('p')).not.toBe(null);
    expect(root.querySelector('p').textContent.includes(message)).toBe(true);
  });
});
