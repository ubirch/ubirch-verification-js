import { BehaviorSubject, Observable } from 'rxjs';
import { UbirchMessage } from '../models/models';

export const infoSubject = new BehaviorSubject<UbirchMessage>(null);
export const infoWatcher$: Observable<UbirchMessage> = infoSubject.asObservable();
